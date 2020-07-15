const { quote } = require('shell-quote');

module.exports = {
  '*.(j|t)s?(x)': (filenames) =>
    filenames.reduce((commands, filename) => {
      commands.push(quote(['prettier', '--write', filename]), quote(['git', 'add', filename]));
      return commands;
    }, []),
};