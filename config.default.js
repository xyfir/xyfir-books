exports.environment = {
  type: 'development',
  // type: 'production',
  port: 12345,
  runCronJobs: false
};

exports.database = {
  mysql: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'xyfir_books',
    connectionLimit: 100,
    waitForConnections: true
  }
};

exports.keys = {
  xyAnnotations: '',
  accessToken: '',
  xyPayments: '',
  xyAccounts: '',
  mailgun: 'key-',
  session: ''
};

exports.ids = {
  xyAnnotations: 1,
  xyAccounts: 2,
  xyPayments: {
    seller: 3,
    products: {
      tier1: 4,
      tier2: 5,
      tier3: 6,
      threeMonthSwiftDemand: 7
    }
  }
};

exports.addresses = {
  xyAnnotations: 'http://.../',
  xyAccounts: 'http://.../',
  xyPayments: 'http://...',
  library: 'http://.../',
  mailgun: {
    domain: '',
    api: `https://api:${exports.keys.mailgun}@api.mailgun.net/v3/`
  },
  xyBooks: {
    root: 'http://.../',
    callback: 'http://.../'
  }
};
