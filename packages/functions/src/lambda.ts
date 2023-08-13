import axios from 'axios';
import AWS from 'aws-sdk';
import { format } from 'date-fns';

// Configure AWS
const s3 = new AWS.S3({
    region: 'ap-southeast-2',
});

const BUCKET_NAME = 'imran-my-sst-app-api-colesscrapebucket891ed9db-olvy3epl93ps';

const categories = [
    'meat-seafood',
    'fruit-vegetables',
    'dairy-eggs-fridge',
    'bakery',
    'deli',
    'pantry',
    'drinks',
    'frozen',
    'household',
    'health-beauty',
    'baby',
    'pet',
    'liquor',
    'tobacco',
    'bonus-characters',
];

async function scrapeCategory(timestampFolder: string, category: string) {
    console.log(`Processing category ${category}`);

    const response = await axios.get(`https://www.coles.com.au/_next/data/20230809.01_v3.45.0/en/browse/${category}.json`, {
        headers: {
            'accept': '*/*',
            'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
        }
    });

    if (response.status !== 200) {
        console.error(`Scraping ${category} failed.`);
        return;
    }

    const filename = `coles/${timestampFolder}/coles_response_${category}.json`;

    await s3.putObject({
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: JSON.stringify(response.data),
        ContentType: 'application/json'
    }).promise();

    console.log(`Saved data for category: ${category}`);
}

export const handler = async () => {
    const timestampFolder = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');

    for (const category of categories) {
        await scrapeCategory(timestampFolder, category);
    }

    console.log('Data scraped successfully!');
};
