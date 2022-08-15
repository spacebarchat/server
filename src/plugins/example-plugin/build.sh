#rm -rf dist/
#mkdir dist
rm -rfv *.js *.js.map
ln -s ../../bundle/node_modules node_modules
tsc -p .
