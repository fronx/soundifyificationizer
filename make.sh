(cd txt; for f in `ls`; do fn=`echo "../out/$f--v1.mid"`; echo $f; cat $f | node ../text_to_midi.node.js > `echo $fn`; done)
