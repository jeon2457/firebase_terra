<?php
require_once __DIR__ . '/php/db-connect-mongo.php';
$collections = $database->listCollections();
foreach ($collections as $collection) {
    echo $collection->getName() . PHP_EOL;
}
