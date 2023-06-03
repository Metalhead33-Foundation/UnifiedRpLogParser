# UnifiedRpLogParser
The successor to [FListNoteArchiveConverter](https://github.com/Metalhead33-Foundation/FListNoteArchiveConverter), [pidgin-log-parser](https://github.com/Metalhead33-Foundation/pidgin-log-parser) and [phpbb-forum-parser](https://github.com/Metalhead33-Foundation/phpbb-forum-parser), and possibly others.

It takes RPG logs from various sources, and outputs them in a format intended for [my wiki](https://waysofdarkness.miraheze.org/wiki/Main_Page).

```
{{RPG Post/<poster's character name>
|date=<post date>
|post=<post content>
}}
```

JSON support intended to be added in the future.

You are intended to build it this way on Linux:

```
git clone https://github.com/Metalhead33-Foundation/UnifiedRpLogParser.git
cd UnifiedRpLogParser
npm install
npm run build
# After this, you can just call node build/index.js
```
After this, you execute the code with `node build/index.js <argument>`

The following arguments are used:

```
--mode : Sets the type of logs this app is supposed to process: only FListNotes and Pidgin are supported currently. Case insensitive.
--input : The path to the file this program should process. Most modes require it.
--output : Optional argument for the output file's path. If not set, the program will set it automatically to have the same location and name as the input file, but with a different extension.
```
