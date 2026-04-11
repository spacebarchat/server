#! /usr/bin/env sh
#for s in {16,32,48,64,96,128,256,512,4096}; do time curl http://localhost:5000/scale/avatars/1006598230156341276/cc0a23b479ef23641480d53a49f1b3db\?size=$s\&quality\=high | kitty icat; done
for i in {1..6}; do
  for s in {16,32,48,64,96,128,256,512,1024,2048,4096}; do
      echo curl http://localhost:5000/defaultAvatar/${i}.png\?size=$s\&quality\=low #| kitty icat
  done
done
