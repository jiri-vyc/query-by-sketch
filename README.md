# Project description #

Goal of the project is to create an application that allows user to draw a sketch and then search for similar pictures.

This application allows drawing sketch or uploading image and searching for similar images. In the result list, users can choose new reference image to search similar pictures for. So it matches the query & browsing modalities of retrieval.

### How is it done ###

For evaluating pictures similarity, [SIFT](https://en.wikipedia.org/wiki/Scale-invariant_feature_transform) algorithm is used. It extracts a collection of feature vectors, which represent scale, rotation, illumination and distortion invariant features of the picture. These descriptors are then compared between the two pictures - 2 nearest neighbours([euclidean distance](https://en.wikipedia.org/wiki/Euclidean_distance)) are found for each vector, and when the ratio between their distances is less than certain threshold, it is evaluated as a match. For threshold 0.8, 90% false matches are discarded, as well as only 5% correct ones.[[1]](https://en.wikipedia.org/wiki/Scale-invariant_feature_transform#cite_note-Lowe2004-3) The pictures with most matches respective to the reference image are the most similar.

For Front-end "drawing tool" part of the application, [HTML5 Canvas](http://www.w3schools.com/html/html5_canvas.asp) element is used and the drawing is manipulated by JavaScript (jQuery). It registers events on this canvas - mousedown, mouseup, mousemove - and performs currently selected action. For drawing rectangles, second "temporary" canvas is made, on which everything is drawn during creating the rectangle and as soon as mouse button is up, what is currently drawn on temporary canvas is copied to the result canvas. That way we can see all the real-time rectangle creation, while only keeping the final shape of it.

Image from canvas can be them AJAX POSTed to server as a base64 data, server then decodes it, saves as .PNG and sends back a response with updated list of images, which is immediately displayed on the page. 

Server also supports image upload by traditional form. When uploading image this way, server saves it in its current form, but allows for additional editing in the aforementioned drawing tool.

### Implementation ###

Server part of the application is written in [node.js](https://nodejs.org/en/) with use of [MongoDB](https://www.mongodb.org/) database, several native node.js modules with no external dependencies and module [gm](http://aheckmann.github.io/gm/) with dependency on [GraphickMagick](http://www.graphicsmagick.org/) for image manipulation. For the SIFT extraction part [VLFeat library](http://www.vlfeat.org/) is used and the front-end part is HTML5/JavaScript. Also [bootstrap](http://getbootstrap.com/) is used for UI. 

Used technologies, modules, libraries.

* [node.js](http://nodejs.org/)
* * [express](http://expressjs.com/) framework
* * [jade](http://jade-lang.com/) templating engine
* * [MongoDB](https://www.mongodb.org/) database
* [GraphicsMagick](http://www.graphicsmagick.org/)
* [VLFeat's SIFT](http://www.vlfeat.org/overview/sift.html)
* [jQuery](https://jquery.com/)
* [bootstrap](http://getbootstrap.com/)
* [NProgress](http://ricostacruz.com/nprogress/)
* [lightbox2](http://lokeshdhakar.com/projects/lightbox2/)
* [bootstrap slider](http://www.eyecon.ro/bootstrap-slider/)

### Usage example ###

* Draw picture
![scr1.png](https://bitbucket.org/repo/6yX7aq/images/1251251080-scr1.png)
* Find similar
![scr2.png](https://bitbucket.org/repo/6yX7aq/images/1086271621-scr2.png)
* Keep exploring 
![scr3.png](https://bitbucket.org/repo/6yX7aq/images/2273129758-scr3.png)

### Discussion ###

During the development, it occurred to me, that node.js is not particularly suitable for heavy server-side computations, which have to finish in its entirety before displaying results to user and are thus at the very least inconvenient to use in fully asynchronous environment. At the moment, in the project the most computation-heavy part is made to run synchronously (via node module sync and node fibers). This could be done better, eg. by polling for incremental results and after each new result part received, do the re-sorting client-side. 

That way user would see some results very fast, even with huge database and the more they wait, they would see more and more accurate results.

Also SIFT image similarity can be inaccurate while processing simple sketches of this character and it works only with grey-scale pictures. In the future, I would like to add at least one other, different method of evaluating similarity, compare it with current one and then probably use combination of both as indicator of final similarity.

### Conclusion ###

The goal of the project was met and the application can successfully search for similarities in pictures based on query in the form of sketch or uploaded picture. The issue is speed and current synchronous character of the computation. There is a lot of room for improving.