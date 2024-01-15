import Token from './token.js';
const _apiHost = 'http://localhost:8087/api/v1';

async function request(url, params, method = 'GET') {

  let token = Token.getToken();

  //Necessário para deixar o navegador identificar quando fom um FormData
  let contentType = undefined;

  //Objeto que será usaro para configurar o fetch
  const options = {
    method,
    headers: {}
  };

  if (params) {
    if (method === 'GET') {
      //No método GET os parâmetros são passado após a url? Ex: http://a.com?a=1&b=2
      url += '?' + objectToQueryString(params);
    } else {
      //Se for um FormData passar direto para o body
      if (params instanceof FormData) {
        options.body = params;
      } else {
        //No contexto da aplicação só pode ser um JSON
        contentType = 'application/json';
        options.body = JSON.stringify(params); //Converter o objeto JS em JSON
      }
    }
  }

  if (contentType) {
    //Se o contentType é nulo deixar o navegador identificar, isso resolve o problema do webkitformboundary
    //https://stackoverflow.com/questions/41188903/what-does-webkitformboundary-mean
    options['headers']['Content-Type'] = contentType;
  }

  if (token) {
    options['headers']['Authorization'] = token;
  }

  // try {
    const response = await fetch(_apiHost + url, options);
    const result = await response.json();
  
    if (response.status !== 200) {
      throw new Error(result.detail);
    }  

    return result;

}

function objectToQueryString(obj) {
  return Object.keys(obj).map(key => key + '=' + obj[key]).join('&');
}

export default {request};