export default function parseCommandLineArgs(args: string[]): Map<string, string> {
    const argMap: Map<string, string> = new Map();
    let currentKey: string | null = null;
  
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
  
      if (arg.startsWith("--")) {
        // Check if the argument starts with "--" and assume it's a key
        const key = arg.slice(2);
        currentKey = key.toLocaleLowerCase();
      } else if (currentKey !== null) {
        // If we have a current key, assume the argument is its value
        argMap.set(currentKey, arg);
        currentKey = null;
      } else {
        // If no current key, ignore the argument
        continue;
      }
    }
  
    return argMap;
}
  