<?php
require './php/db-connect-mongo.php';
$doc = $database->images->findOne();
if ($doc) {
    foreach ($doc as $k => $v) {
        echo $k . ' (' . gettype($v) . ') : ' . (is_object($v) ? get_class($v) : $v) . "\n";
    }
} else {
    echo "No documents found in images collection.\n";
}
