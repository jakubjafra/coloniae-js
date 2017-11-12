<?php

// return JSON with list of images in imgs/ dir

$array = [];

foreach(glob("imgs/*.png") as $filename) {
	preg_match("/\/(\w+)\./", $filename, $matches);
    $array[] = ($matches[1]);
}

$json = json_encode($array);

// file_put_contents("imgs_list.json", $json);
echo $json;

?>