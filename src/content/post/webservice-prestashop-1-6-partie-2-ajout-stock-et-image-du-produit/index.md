---
title: Ajout Stock et Image via Webservice Prestashop 1.6 Part 2
description: Utilisation de l'API/Webservice Prestashop pour envoyer des produits, partie 2.
publishDate: "24 Aug 2015"
tags: ["Prestashop 1.6", "Prestashop Webservice"]
---

## Introduction

Cet article est la 2ème partie d'une série sur l'API de Prestashop.

Voir la [Partie 1](/blog/webservice-prestashop-1-6-partie-1-configuration-ajout-categorie-et-produit/) pour la configuration initiale, l'ajout de la catégorie et du produit

On reprend directement où on s'est arrêté dans la [partie 1](/blog/webservice-prestashop-1-6-partie-1-configuration-ajout-categorie-et-produit/) avec l'id du produit précédemment inséré.

## Ajout du stock produit.

Le principe ici sera de récupérer le produit que l'on a inséré en GET. Ensuite on se placera dans le noeud "stock\*availables" du produit dans lequel on bouclera suivant le nombre de déclinaisons du produit.
\*(Ici nous n'avons pas inséré de déclinaison mais j'essaye de proposer une approche globale)\_.

Une fois à l'intérieur de la boucle on va poster vers la ressource **/api/stock_availables** et c'est ici qu'on définira le stock.

```php
//... index.php (voir partie 1)
//on récupère l'id du produit inséré
$ps_product_id = $xml->product->id;

$opt['resource'] = 'products';
$opt['id'] = $ps_product_id;
$xml = $webService->get($opt);
//(les "stock_availables ont créé automatiquement par PS à l'insert du produit précédent)
foreach ($xml->product->associations->stock_availables->stock_available as $stock) {

    $xml2 = $webService->get(array('url' => $url . '/api/stock_availables?schema=blank'));
    $stock_availables = $xml2->children()->children();
    $stock_availables->id = $stock->id;
    $stock_availables->id_product  = $ps_product_id;
    $stock_availables->quantity = 50;
    $stock_availables->id_shop = 1;
    $stock_availables->out_of_stock = 1;
    $stock_availables->depends_on_stock = 0;
    $stock_availables->id_product_attribute = $stock->id_product_attribute;

    //POST des données vers la ressource
    $opt = array('resource' => 'stock_availables');
    $opt['putXml'] = $xml2->asXML();
    $opt['id'] = $stock->id ;
    $xml2 = $webService->edit($opt);
}
```

Maintenant notre produit a bien un stock de 50 unités !
![prestashop webservice 1.6 stock](./stock-produit-webservice-ps16.png)

## Ajout de l'image produit.

### Testé sous PHP >= 5.5

Si une version de PHP plus ancienne est installée sur votre serveur rendez-vous [sur la documentation officielle ](http://doc.prestashop.com/display/PS16/Chapter+9+-+Image+management)

Pour l'image produit nous allons utiliser [la librairie cURL de php](http://php.net/manual/fr/book.curl.php). Pour cela nous posterons vers la ressource /api/images/products/ en utilisant toujours l'id du produit récemment créé.

Toujours à la suite dans notre **index.php**.

```php
/* Ajout de l'image Produit */
$urlImage = $url.'/api/images/products/'.$ps_product_id.'/';
//entrez ici le chemin de l'image complet pour votre fichier
$image_path = 'public/img/product_webservice.png';
$image_mime = image_type_to_mime_type(exif_imagetype($image_path));

$args['image'] = new CurlFile($image_path, $image_mime);

$ch = curl_init();
curl_setopt($ch, CURLOPT_HEADER, 1);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLINFO_HEADER_OUT, 1);
curl_setopt($ch, CURLOPT_URL, $urlImage);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_USERPWD, $key.':'); //API KEY Prestashop
curl_setopt($ch, CURLOPT_POSTFIELDS, $args);
$result = curl_exec($ch);
curl_close($ch);
```

En cas d'envoi groupé de produits, on ne peut pas être sûr du type de fichier de chaque image produit à envoyer, c'est pour cela que cette ligne existe :

```php
$image_mime = image_type_to_mime_type(exif_imagetype($image_path));
```

_NB: comparativement à la documentation officielle en PHP 5.5 ou supérieur nous utilisons la classe CurlFile pour envoyer des fichiers/images_

Et voila !

## Conclusion.

Au travers de ces 2 parties nous avons vu comment envoyer un produit vers le webservice de Prestashop. Il faut bien faire attention à l'ordre des données envoyés car certaines ressources sont dépendantes de l'ID d'une autre ressource.

N'oubliez pas **?shchema=synopsis** à la fin d'une URL de ressource pour bien voir quel noeud XML doit être obligatoirement rempli.

Pour vous présenter l'information de la façon la plus condensée possible, on a tout écrit dans un seul et même fichier PHP mais il est bien sûr évident, que faire de belles **classes** et exporter dans différentes **méthodes** les étapes de l'export **est la meilleur marche à suivre**!

Malgré tout je mets à votre disposition tout ce que l'on a fait dans la partie 1 et 2 sur github.

[Disponible ici ](https://github.com/PhilDL/learning-ps-webservice)

Ou bien clonez directement le repo et installez :

```shell
    git clone https://github.com/PhilDL/learning-ps-webservice
    cd learning-ps-webservice
    composer install
```

**A bientôt !**
