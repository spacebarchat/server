#rm -rf dist/
#mkdir dist
rm -rfv *.js *.js.map
ln -s ../../bundle/node_modules node_modules
mkdir -p ../../node_modules/@fosscord
ln -s ../../util ../../node_modules/@fosscord/util
ln -s ../../api ../../node_modules/@fosscord/api
tsc -p .
