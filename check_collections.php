<?php
require './php/db-connect-mongo.php';
$collections = $database->listCollections();
foreach ($collections as $collectionInfo) {
    echo $collectionInfo->getName() . "\n";
}
