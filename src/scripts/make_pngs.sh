#!/bin/sh

cd ../assets

for f in *.svg; do
	SVG=$f
	PNG=${f%.*}.png
	echo "Converting $SVG to $PNG"

	convert -resize 64x64 -background none $SVG $PNG
done 