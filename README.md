## Highlights
## Notes
iOS Kindle app -> SendGrid -> Firebase

https://sendgrid.com/docs/for-developers/parsing-email/setting-up-the-inbound-parse-webhook/
- create cname entries from instructions provided by SendGrid
	- takes 4-8 hours to propagate
	- the cname host value changes every time you renavigate to verify the DNS
	-  records
	- the sendgrid cname value for namecheap needs to remove the ".striblet.com"
- Add Host & Url
	- getting "Bad Request when adding domain and destination url"
	- had to add "https://" to the url for POST Data.
	- add the following to a MX record on NameCheap
		- @ for name, "mx.sendgrid.net" for value
- Posting data
	- testing use ngrok & firebase emulators:start
	
- parsing data
	- set up cloud functions for the node.js server / parser
	- run this setup to get acquainted https://firebase.google.com/docs/functions/get-started?authuser=0
	- NEED TO convert buffer to string!!!! 
	-  

- html & css

