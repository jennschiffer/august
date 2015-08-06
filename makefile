# baby's first makefile

hint: 
	jshint public/js/app/*.js

run:
	node index.js
  
nodemon:
	nodemon index.js
	
.PHONY: hint run nodemon