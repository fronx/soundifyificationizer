(cd txt; for f in `ls`; do fn=`echo "../out/$f--noob.mid"`; echo $f; cat $f | mode=noobs node ../text_to_midi0.node.js > `echo $fn`; done)
