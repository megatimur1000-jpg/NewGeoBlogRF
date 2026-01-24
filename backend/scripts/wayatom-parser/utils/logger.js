const chalk = require('chalk');

class Logger {
  info(message) {
    console.log(chalk.blue(`[INFO] ${new Date().toISOString()} - ${message}`));
  }

  warn(message) {
    console.log(chalk.yellow(`[WARN] ${new Date().toISOString()} - ${message}`));
  }

  error(message) {
    console.log(chalk.red(`[ERROR] ${new Date().toISOString()} - ${message}`));
  }

  success(message) {
    console.log(chalk.green(`[SUCCESS] ${new Date().toISOString()} - ${message}`));
  }
}

module.exports = new Logger();