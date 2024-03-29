# SnydersWeb-v4
The latest iteration of my personal website that uses SVG graphics, Custom Web Components, Animations, mobile support, forward and back button support, and ES6 JavaScript.

## See it in action
You can see it in action at [SnydersWeb.com](https://www.snydersweb.com/).

## Technologies
* SVG graphics
* Custom Web Components
* Animations
* ES6 JavaScript

## Purpose
* Learn and use Custom Web Components
* Use the latest client side technologies
* Showcase my abilities

## About
My old site was around for a whopping 19 years!  Still, most of it aged fairly well considering it was written before AJAX was common and way done without the debugging tools we have today.  No firebug or anything of the sort.  It even worked in the dreaded time vampire known as IE6.  One of the big reasons why it went so long without updates was also because my work kept me very busy doing web work. (The cobbler's kids always need shoes as the saying goes.)<br />

2024 came with an unexpected.... gift of time and with it an opportunity to update this site to once again showcase what I can do and more.  It was also an opportunity to do some things I've never done before and have fun doing them. <br />

In spite of the fact that most of the interface looks much the same, this site is a completely different animal on the inside!  The build was to be very ambitious - SVG graphics, Custom Web Components, Animations, mobile support, forward and back button support, and ES6 JavaScript would be used.  I also wanted to be sure all the old site's flaws were fixed, such as using the back button. <br />

I used Inkscape to re-create all the old raster graphics.  The files it generated were perfect for converting into a web browser SVG file.  Having editable SVG files was a boon as it allowed me to very quickly and easily adjust colors.  SVG can also be infinitely scaled which is also useful.  The only downside is the resulting files are a tad larger than their raster predecessors.<br />

Custom Web Components have been interesting.  This was my first time creating and using them.  The shadow DOM and embedded CSS posed a few challenges.  The biggest challenge was styling and image pathing.  In regular CSS, background images are sourced reactive to the location of the CSS file itself - in the case of components, the style images are based on where the browser is.   I had to add some code to correct that.  Components also don't seem to support a print Style Sheet either.  Accessibility also is a challenge - the shadow DOM seems to be invisible.   On the plus side, they made my regular HTML beautiful.  They saved at least 15 lines of code per topic bar!  They also presented some fun ideas to implement animation by simply changing an attribute - this allowed the SubTopic and Topic bars to prettymuch handle themselves.  I debated componentizing the main content panel but opted against it due to the trade-offs involved.<br />

The new animation capability is very nice.  It allows for some extremely clean and simple code to create and implement.  It took only a few short hours to fully develop the "boot sequence" for this site from scratch.  The animations are great as they can provide simple ways to enhance the user experience. <br />

Mobile devices are for better or worse the way most of us read web pages, including myself!  Having a good mobile experience here is paramount to success.  To implement that I made my CSS to be resolution - sensitive.  The layout changes around to (hopefully) be more accommodating - though I also include redundant links in the content body that does the same thing as the interface components. <br />

For forward and back support I use the URL hash.  With each page change, the hash is updated to your location.  This allows not only the browser navigation buttons to function, but also allows bookmarking and refreshing.  This solves one of the biggest problems of sites that dynamically pull content in via AJAX.<br />

I love ES6.  This latest version of  JavaScript has some very powerful tools baked in.  Map, forEach, spread operators, and deconstruction all played a part in making complex operations elegant.  My old site was ~2500 lines of code and this one is 1000 lines less yet does more and better!  I was able to knock out this entire site in roughly 2 weeks.<br />