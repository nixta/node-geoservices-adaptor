I didn't like the Citibike app.

What was missing?
* Terrible symbology on the map (nearly empty? nearly full? terrible!!)
* No alerts
* No directions
* No historical/trend information
* Only what Citibank want shown (ATMs and branches? Really?)
* Can't tell whether it's refreshed

Did some searching and before I found out that Citibike has their own endpoint, I found
Citybik.es. Figured anything I'd want to do for NYC could be useful elsewhere, so OK!

But (show the format): http://api.citybik.es/citibikenyc.json

I also wanted to do some analysis on the data.

Lots of tools at my disposal if only the data were in the right format.

I could scrape and push to a static store, but why not just redirect to the live source?

So, node-geoservice-adaptor (at esri.github.io) [http://github.com/esri/node-geoservice-adaptor

It started off as an experiment to teach myself node.js
Plus it would teach me about our services - I like to get hands on
And anyway, node.js is all the rage, right?

Then I built a WebMap. Wait - our platform with no extra coding etc. just displaying
live Citybike data. What is this?

And that can open in our COTS app and SDKs/APIs.

So now I have this data here
More than just Citibike.
, and it's exposed to us. But not to ordinary people.

So, before I build my killer iOS app, I'm going to just build a quick web viewer to look
at all global data.

Wanted to build my own app and to think about how to do intelligent things things as part of the app.



1) Why

2) What

3) 
