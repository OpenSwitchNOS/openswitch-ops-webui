# Put this in your .bash_aliases:
# . <path-to-this-file>/aliases.sh

# TODO: sourcemap back into Halon install
# TODO: Halon build should be: 'npm run test; npm run buildprod'

alias wb='npm run build'
alias wbw='npm run buildwatch'
alias wbd='npm run builddebug'
alias wbp='npm run buildprod'
alias ws='npm run start'
alias wtw='npm run testwatch'
alias wt='npm run test'
alias wds='./node_modules/webpack-dev-server/bin/webpack-dev-server.js --hot --inline'
