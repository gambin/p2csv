# Installation Guide

Make sure that these files are available on your SharePoint site:

- jQuery 1.8+ (recommended 1.8.3) -> http://jquery.com/download/
- SPServices 0.7.2 ->http://spservices.codeplex.com/releases/view/81401
- p2csv 0.2.1 -> http://p2csv.codeplex.com/releases

You can include them on a specific page, but it's recommended that you reference them on site master page. Use the following example:
```
<head>
...
<script type="text/javascript" src="PATH-TO-YOUR-FILE\jQuery-file.js"></script>
<script type="text/javascript" src="PATH-TO-YOUR-FILE\SPServices-file.js"></script>
<script type="text/javascript" src="PATH-TO-YOUR-FILE\p2csv-file.js"></script>
...
</head>
```

ATTENTION: you must include on the same order described above (jQuery / SPServices / p2csv)

## Ready to use (graphical version)
 
After changing the master page, access the site or list you want and press Ctrl + F5 (just to force a cache refresh), click on Site Action menu and choose one of the options available to export permissions using p2csv!

## Ready to use (console version)

To use p2csv you just need to access your browser console. Usually press F12 to show the Developer Tools and click on Console tab.
You can use an updated Google Chrome or Internet Explorer 10 (running on IE 10 mode) and type the following command on your browser Console tab:

```
$().p2csv();
```
This command will export the actual site permissions.
To export the list permissions, access a list url type the following command on Console tab:

```
$().p2csv({scope:'list'});
```
By default, p2csv uses ',' as separator.
To change it, just type the following command:

```
$().p2csv({separator:';'});
```
Just click on Download Link on the page:

## Need more help?

Take a look on the following video, all steps covered:

https://vimeo.com/60941167

Enjoy :D
