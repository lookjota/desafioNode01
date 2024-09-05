import { parse } from "csv-parse";
import fs from 'node:fs'

const filePath = new URL('./tasks.csv', import.meta.url)

export async function processCSV() {
    const parser = fs.createReadStream(filePath).pipe(parse({
        delimiter: ',',
        skipEmptyLines: true,
        fromLine: 2
    }));
    
    for await (const record of parser) {
        const [ title, description ] = record

        await fetch('http://localhost:3333/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                description
            }),
            duplex: 'half'
        }).then(response => {
            return response.text()
        }).then(data => {
            console.log(data)
        })
    }
}

processCSV().catch(err => console.error('Error processing CSV:', err));