#!/bin/sh
rm -f ../plugin.eventfuncs.generated
rm -f ../plugin.imports.generated
while read event
do
    echo Making event $event...
    (
        echo 'import { EventResult } from ".";'
        echo ''
        echo "export interface Pre${event}EventArgs {"
        echo '    '
        echo '}'
        echo "export interface Pre${event}EventResult extends EventResult {"
        echo '    '
        echo '}'
        echo ''
        echo "export interface On${event}EventArgs {"
        echo '    '
        echo '}'
    ) > ${event}EventArgs.ts.generated
    (
        echo "    public static async pre${event}Event(args: Pre${event}EventArgs): Promise<Pre${event}EventResult[]> {"
        echo "        return (await Promise.all(PluginStore.plugins.filter(x=>x.onPre${event}).map(x=>x.onPre${event} && x.onPre${event}(args)))).filter(x=>x) as Pre${event}EventResult[];"
        echo '    }'
        echo '    '
        echo "    public static async on${event}Event(args: On${event}EventArgs): Promise<void> {"
        echo "        await Promise.all(PluginStore.plugins.filter(x=>x.on${event}).map(x=>x.on${event} && x.on${event}(args)));"
        echo '    }'
        echo '    '
    ) >> ../PluginEventHandler.ts.3
    (
        echo "    /**"
        echo "    * ${event}Event: document me"
        echo "    *"
        echo "    * @param {On${event}EventArgs} args Info about what's going on"
        echo "    * @memberof Plugin"
        echo "    */"
        echo "    async on${event}?(args: On${event}EventArgs): Promise<void>;"
        echo '    '
        echo "    /**"
        echo "    * ${event}Event: Executed before changes are announced"
        echo "    * document me."
        echo "    *"
        echo "    * @param {Pre${event}EventArgs} args Info about what's going on"
        echo "    * @return {Pre${event}EventResult} How event should be handled"
        echo "    * @memberof Plugin"
        echo "    */"
        echo "    async onPre${event}?(args: Pre${event}EventArgs): Promise<Pre${event}EventResult>;"
    ) >> ../plugin.eventfuncs.generated

    echo "import { Pre${event}EventArgs, On${event}EventArgs, Pre${event}EventResult } from './event_types';" >> ../PluginEventHandler.ts.1
    echo "import { Pre${event}EventArgs, Pre${event}EventResult, On${event}EventArgs } from '.';" >> ../plugin.imports.generated
    cmp --silent "${event}EventArgs.ts" "${event}EventArgs.ts.generated" && rm -f "${event}EventArgs.ts.generated"
done < _pdo

echo 'Building PluginEventHandler...'

rm -f ../PluginEventHandler.ts.generated
(
    echo 'import { PluginStore } from ".";'
    echo ''
    echo 'export class PluginEventHandler {'
) > ../PluginEventHandler.ts.2
echo '}' > ../PluginEventHandler.ts.4
for i in {1..4}
do
    cat "../PluginEventHandler.ts.$i" >> ../PluginEventHandler.ts.generated
    rm -f ../PluginEventHandler.ts.$i
done
cmp --silent ../PluginEventHandler.ts ../PluginEventHandler.ts.generated && rm -f ../PluginEventHandler.ts.generated

echo 'Rebuilding indexes...'
node ../../../../scripts/gen_index.js .. --recursive
echo 'Done!'