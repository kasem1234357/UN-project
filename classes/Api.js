const { responce_status } = require("../constraints/RESPONCE_STATUS");
const CustomError = require("./Error");
/**
 * Configuration options object.
 * @typedef {Object} Options
 * @property {?string} customMsg - Custom message (nullable). Default: `null`.
 * @property {?number|string} status - Status indicator (nullable). Can be numeric or string code. Default: `null`.
 */

/**
 * Application options configuration.
 * @type {Options}
 */
const options = {
  customMsg:null, 
  status:null
}
class API {
  #pagging = null
  /*
  {
    totalRecords:0,
    pageSize:0,
    pageNumber:0,
    firstPage:0,
    lastPage:0,
    previousPage:0,
    nextPage:0,
    totalPages:0,
    firstItem:{},
    lastItem:{},
    withPaging:false
  }
    */
  constructor(request, response, query = null ,queryParams=[]) {
    this.req = request;
     this.res = response;
      this.query = query;
      this.queryParams = queryParams;
      

  }

  /**
   * Get request parameters.
   * @returns {any}
   */
  getParams() {
    return this.req.params;
  }
  logRequest() {
    console.info({
      method: this.req.method,
      path: this.req.path,
      params: this.req.params,
      query: this.req.query,
      body: this.req.body,
      headers: this.req.headers,
      user: this.req.user,
    });
  }
   /**
   * Get and parse request query parameters.
   */
  getQuery() {
    const excludeFields = ["sort", "limit", "page", "fields"];
    
    let queryObject = { ...this.req.query };
    const otherQuery = {};
    excludeFields.forEach((el) => {
      if (queryObject[el]) {
        otherQuery[el] = queryObject[el];
        delete queryObject[el];
      }
    });
    let filteringQuery = JSON.stringify(queryObject);
    filteringQuery = filteringQuery.replace(
      /\b(gte|lte|lt|gt)\b/g,
      (match) => `$${match}`
    );
    /**
     * @returns {allQuery: query,otherQuery,filteringQuery}
     */
    return {
      allQuery: this.req.query,
      otherQuery,
      filteringQuery,
    };
  }
  getBody() {
    return this.req.body;
  }
  // Authorization
  /**
   * 
   * @param {[string]} requiredPermissions 
   * @returns {Boolean}
   */
  checkPermissions(requiredPermissions) {
    const userPermissions = this.user.permissions;
    const hasPermission = requiredPermissions.every(perm => userPermissions.includes(perm));
    if (!hasPermission) {
      return false
    }
    return true
  }
/**
 * Handles data processing with customizable response options
 * @param {keyof responce_status} [type='default'] - Response type from predefined status keys
 * @param {any} [data=null] - Main data payload
 * @param {Object} [options={}] - Configuration options
 * @param {?string} [options.customMsg=null] - Custom message override (nullable)
 * @param {?(number|string)} [options.status=null] - Status code override (nullable, number or string)
 * @param {any} [pagging=null] - Pagination information
 * @returns {any} Processed response data
 */
  dataHandler(type = "default", data = null,options={},pagging=this.#pagging ) {
    const isList = (data && data.length !== undefined)
    const responseData = data
      ?!isList? {
          status: "success",
          isSuccess:true,
          key:options?.status || responce_status[type].status,
          pagging:null,
          ...data,
          message: options?.customMsg || responce_status[type].msg,
          
        }:{
          status: "success",
          isSuccess:true,
          key:options?.status || responce_status[type].status,
          pagging:null,
          dataList:data,
          message: options?.customMsg || responce_status[type].msg,
          
        }
      : {
          status: "success",
          isSuccess:true,
          key:options?.status || responce_status[type].status,
          message: options?.customMsg || responce_status[type].msg,
          
        };


    this.res.status(options?.status || responce_status[type].status).json(responseData);
  }
   /**
   * Handle errors.
   * @param {keyof responce_status} type - Error type.
   * @param {string} message - Error message.
   * @param {number} customStatus - HTTP status code.
   * @returns {CustomError} Custom error object.
   */
  errorHandler(type = "server_error", message = null, customStatus = null) {
    return new CustomError(
      message || responce_status[type].msg,
      customStatus || responce_status[type].status
    );
    
  }
 /**
   * Modify the query and query parameters.
   *  @param {import("express").Request} query - Query object.
   * @param {Array} queryParams - Query parameters.
   */
  /*
  api.modify(Product.find()).filter().sort().limitFields().paginate()
 const products = await api.query
 */
  modify(query,queryParams) {
    this.query = query;
    this.queryParams = queryParams
    /**
     * @returns {this}
     */
    return this
  }
  /**
   * Sort the query results.
   */
  sort() {
  const sortQuery = this.getQuery().otherQuery?.sort;
  const sortStage = sortQuery
    ? sortQuery.split(',').reduce((acc, field) => {
        const [key, order] = field.startsWith('-')
          ? [field.slice(1), -1]
          : [field, 1];
        acc[key] = order;
        return acc;
      }, {})
    : { createdAt: -1 };

  // Handle aggregate or find
  if (Array.isArray(this.query?._pipeline)) {
    this.query._pipeline.push({ $sort: sortStage });
  } else {
    this.query = this.query.sort(sortStage);
  }

  return this;
}
  filter(searchableFields = [], numericFields = []) {
  const queryFilter = JSON.parse(this.getQuery().filteringQuery || '{}');

  // Build $match object
  const match = {};
  for (let key of Object.keys(queryFilter)) {
    const value = queryFilter[key];

    if (value === undefined || value === '') continue;

    if (numericFields.includes(key)) {
      match[key] = parseInt(value);
    } else if (searchableFields.includes(key)) {
      match[key] = { $regex: new RegExp(value, 'i') };
    } else {
      match[key] = value;
    }
  }

  // If this.query is an aggregation pipeline (array), inject $match
  if (Array.isArray(this.query?._pipeline)) {

    this.query._pipeline.unshift({ $match: match });
  } else {
    this.query = this.query.find(match);
  }

  return this;
}
  limitFields(fieldsItems) {
 
    const fieldQuery =  this.getQuery().otherQuery.fields ;
    if (fieldQuery) {
      
      const fields = fieldQuery.split(",").join(" ");
      
      
      this.query = this.query.select(fields);
    } 
    else if(fieldsItems){

      const fields = fieldsItems.join(" ");
      
      this.query = this.query.select(fields);
      
    }else  {
      this.query = this.query.select("-__v");
    }
    return this;
  }
  paginate() {
    const page = this.getQuery().otherQuery.page * 1 || 1;
    const limit = this.getQuery().otherQuery.limit * 1 || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
  /**
   * Description 
   *@param {'Access-Control-Allow-Origin'|'Access-Control-Allow-Methods'|'Access-Control-Max-Age'|'Content-Type'|'methods'|'allowedHeaders'|'exposedHeaders'|'credentials'|'origin'|'authorization'} key=null
   * @returns {any}
   */
   getHeaders(key=null) {
    const headers = this.req.headers
    return key?headers[key]:headers
 
 
   }
   /**
    * Description 
    *@param {'Access-Control-Allow-Origin'|'Access-Control-Allow-Methods'|'Access-Control-Max-Age'|'Content-Type'|'methods'|'allowedHeaders'|'exposedHeaders'|'credentials'|'origin'|'authorization'} key
    *@param {any} value 
    * @returns {never}
    */
   setHeader(key,value){
     this.res.setHeader(key, value);
   }
   /**
   * Set cookies in the response.
   * @param {Object} data - Cookie data.
   * @param {{ 
   * httpOnly:Boolean,
   * maxAge:Number,
   * expires:Number,
   * domain:String,
   * path:String,
   * secure:Boolean,
   * sameSite:(Boolean|['strict','lax',"None"]),
   * signed:Boolean,
   * priority:['low','medium','high'],
   * encode}} [option={}] - Cookie options.
   */
   setCookie(data,options={}) {
 //https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie
 //https://dev.to/m__mdy__m/understanding-cookies-and-sessions-in-nodejs-3449
     const defaultOptions = {
       httpOnly:true,
       secure:false,
       sameSite:'lax',
   }
   const finalOptions = { ...defaultOptions, ...options };
     for(let key of Object.keys(data)){
       this.res.cookie(key, data[key], finalOptions)
     }
   }
   getCookie(name=null) {
    const cookies =name? this.req.cookies[name]:this.req.cookies
    return cookies
   }
    /**
   * Validate request parameters.
   * @param {Array} requiredParams - List of required parameters.
   * @returns {boolean}
   */
  validateParams(requiredParams) {
    const params = this.getParams();
    return requiredParams.every(param => param in params);
  }
  /**
 * Validate request parameters.
 * @param {Object} schema - Validation schema.
 * @returns {boolean} Validation result.
 */
validateParamsBySchema(schema) {
  const { error } = schema.validate(this.req.params);
  if (error) {
    this.errorHandler('invalid_request', error.message, 400);
    return false;
  }
  return true;
}

/**
 * Validate request body.
 * @param {Object} schema - Validation schema.
 * @returns {boolean} Validation result.
 */
validateBody(schema) {
  const { error } = schema.validate(this.req.body);
  if (error) {
    this.errorHandler('invalid_request', error.message, 400);
    return false;
  }
  return true;
}


  /**
   * Implement rate limiting.
   * @param {number} limit - Request limit.
   * @param {number} timeWindow - Time window in milliseconds.
   * @returns {boolean}
   */
  rateLimit(limit, timeWindow) {
    const ip = this.req.ip;
    const now = Date.now();
    if (!this.req.rateLimit) {
      this.req.rateLimit = {};
    }

    if (!this.req.rateLimit[ip]) {
      this.req.rateLimit[ip] = [];
    }

    const requests = this.req.rateLimit[ip].filter(timestamp => now - timestamp < timeWindow);
    this.req.rateLimit[ip] = requests;

    if (requests.length >= limit) {
      this.errorHandler('rate_limit', 'Rate limit exceeded', 429);
      return false;
    } else {
      this.req.rateLimit[ip].push(now);
      return true;
    }
  }

   /**
   * Handle request timeouts.
   * @param {number} timeout - Timeout duration in milliseconds.
   */
   handleTimeout(timeout) {
    this.req.setTimeout(timeout, () => {
      this.errorHandler('request_timeout', 'Request timed out', 408);
    });
  }

  /**
   * Integrate custom middleware functions.
   * @param {Function} middleware - Middleware function.
   * @returns {API} API instance.
   */
  useMiddleware(middleware) {
    middleware(this.req, this.res,()=>{});
    return this;
  }

  /**
   * Handle caching of responses.
   * @param {number} duration - Cache duration in seconds.
   */
  cacheResponse(duration) {
    this.setHeader('Cache-Control', `public, max-age=${duration}`);
  }
  setCacheResponseInServer(key, data, ttl = 60) {
    this.cache[key] = {
      data,
      expiry: Date.now() + ttl * 1000,
    };
  }

  /**
   * Get cached response.
   * @param {string} key
   * @returns {any}
   */
  getCachedResponse(key) {
    const cached = this.cache[key];
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
    return null;
  }

}
module.exports = API;

