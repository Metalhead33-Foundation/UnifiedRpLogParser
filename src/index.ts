import parseCommandLineArgs from './ArgMap';
import * as UnifiedRpApi from './UnifiedRpApi';
import path from 'path';
import * as FListNotes from './FListNote';
import * as Pidgin from './Pidgin';
import * as Proboards from './ProboardsThread';
import fs from 'fs';

function mainFlistNotes(args: Map<string,string>) : void
{
    if(!args.has('input'))
    {
        console.log('This mode requires a HTML input. Please provide path to one in the --input argument!');
        return;
    }
    const inputPath = args.get('input')!;
    const outputPath = args.get('output') ?? path.join(path.dirname(inputPath), path.basename(inputPath, path.extname(inputPath)) + '.txt');
    const rawData = UnifiedRpApi.postprocessExtractedData(FListNotes.processFromHtmlFile(inputPath));
    const data = (outputPath.endsWith('.json')) ? JSON.stringify(rawData) : UnifiedRpApi.formatProcessedResult(rawData);
    fs.writeFileSync(outputPath,data);
    return;
}
function mainPidgin(args: Map<string,string>) : void
{
    if(!args.has('input'))
    {
        console.log('This mode requires a HTML input. Please provide path to one in the --input argument!');
        return;
    }
    const inputPath = args.get('input')!;
    const outputPath = args.get('output') ?? path.join(path.dirname(inputPath), path.basename(inputPath, path.extname(inputPath)) + '.txt');
    const rawData = UnifiedRpApi.postprocessExtractedData(Pidgin.extractDataFromHtmlFile(inputPath));
    const data = (outputPath.endsWith('.json')) ? JSON.stringify(rawData) : UnifiedRpApi.formatProcessedResult(rawData);
    fs.writeFileSync(outputPath,data);
    return;
}
function mainProboards(args: Map<string,string>) : void
{
    if(!args.has('input'))
    {
        console.log('This mode requires a HTML input. Please provide path to one in the --input argument!');
        return;
    }
    const inputPath = args.get('input')!;
    const outputPath = args.get('output') ?? path.join(path.dirname(inputPath), path.basename(inputPath, path.extname(inputPath)) + '.txt');
    const rawData = UnifiedRpApi.postprocessExtractedData(Proboards.extractDataFromHtmlFile(inputPath));
    const data = (outputPath.endsWith('.json')) ? JSON.stringify(rawData) : UnifiedRpApi.formatProcessedResult(rawData);
    fs.writeFileSync(outputPath,data);
    return;
}
function mainPhpb(args: Map<string,string>) : void
{
    if(!args.has('forum'))
    {
        console.log('This mode requires a PHPB message board\'s link! Please provide the path to one in the --forum argument!')
        return;
    }
}
function main(args: Map<string,string>) : void
{
    if(!args.has('mode'))
    {
        console.log("Must select mode!\n");
        return;
    }
    switch(args.get('mode')?.toLocaleLowerCase())
    {
        case 'flistnotes': mainFlistNotes(args); break;
        case 'pidgin': mainPidgin(args); break;
        case 'phpb': mainPhpb(args); break;
        case 'proboards': mainProboards(args); break;
        default:
            console.log('Unsupported mode!\n');
            return;
    }
}
main(parseCommandLineArgs(process.argv));