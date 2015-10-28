/**
 * MindTouch Core JS API
 * Copyright (C) 2006-2015 MindTouch, Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import settings from './settings';
import Uri from './lib/uri';
import XhrError from './errors/xhrError';
function _handleHttpError(xhr) {
    return new Promise((resolve, reject) => {

        // Throw for all non-2xx status codes, except for 304
        if((xhr.status < 200 || xhr.status >= 300) && xhr.status !== 304) {
            reject(new XhrError(xhr));
        } else {
            resolve(xhr);
        }
    });
}
function _getText(xhr) {
    return Promise.resolve(xhr.responseText || '');
}
function _doRequest(params) {
    var promise = new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        let requestParams = {
            _: Date.now(),
            origin: 'mt-web' //TODO: F1 req from settings module after 20150820
        };
        if(this.parseJson) {
            requestParams['dream.out.format'] = 'json';
        }
        let url = this.withParams(requestParams).getUrl();
        xhr.open(params.verb, url);
        for(var i in this.headers) {
            if(this.headers.hasOwnProperty(i)) {
                xhr.setRequestHeader(i, this.headers[i]);
            }
        }
        if('mime' in params) {
            xhr.setRequestHeader('Content-Type', params.mime);
        }
        let protocol = this.url.getProtocol();
        if(protocol === null) {
            protocol = window.location.protocol;
        }
        if(protocol === 'https:') {
            xhr.setRequestHeader('Front-End-Https', 'On'); // TODO: Necessary??
        }
        if(this._timeout) {
            console.log(`setting timeout to ${this._timeout}`);
            xhr.timeout = this._timeout;
        }
        xhr.onload = () => {
            resolve(xhr);
        };
        xhr.onerror = () => {
            reject(xhr);
        };
        xhr.ontimeout = () => {
            reject(xhr);
        };
        if('value' in params && params.value !== null) {
            xhr.send(params.value);
        } else {
            xhr.send();
        }
    });
    return promise;
}
export default class Plug {
    constructor(url = settings.get('host'), params = {}) {

        // initailize the url for this instance
        let _url = new Uri(url);
        if('constructionParams' in params) {
            if('segments' in params.constructionParams) {
                _url.addSegments(params.constructionParams.segments);
            }
            if('query' in params.constructionParams) {
                _url.addQueryParams(params.constructionParams.query);
            }
            if('excludeQuery' in params.constructionParams) {
                _url.removeQueryParam(params.constructionParams.excludeQuery);
            }
            if('timeout' in params.constructionParams) {
                this._timeout = params.constructionParams.timeout;
            }
        } else {
            params.constructionParams = {};
        }
        this.url = _url;
        this.headers = params.headers || {};
        this.parseJson = params.raw !== true;
    }
    getUrl() {
        return this.url.toString();
    }
    getHeaders() {
        return this.headers || {};
    }

    at(...segments) {
        var values = [];
        segments.forEach(function(segment) {
            values.push(segment.toString());
        });
        return new Plug(this.url.toString(), {
            headers: this.headers,
            constructionParams: { segments: segments }
        });
    }
    withParam(key, value) {
        let params = {};
        params[key] = value;
        return new Plug(this.url.toString(), {
            headers: this.headers,
            constructionParams: { query: params }
        });
    }
    withParams(values) {
        if(!values) {
            values = {};
        }
        return new Plug(this.url.toString(), {
            headers: this.headers,
            constructionParams: { query: values }
        });
    }
    withoutParam(key) {
        return new Plug(this.url.toString(), {
            headers: this.headers,
            constructionParams: { excludeQuery: key }
        });
    }
    _copyHeaders() {
        let newHeaders = {};
        for(let i in this.headers) {
            if(this.headers.hasOwnProperty(i)) {
                newHeaders[i] = this.headers[i];
            }
        }
        return newHeaders;
    }
    withHeader(key, value) {
        let newHeaders = this._copyHeaders();
        newHeaders[key] = value;
        return new Plug(this.url.toString(), { headers: newHeaders });
    }
    withHeaders(values) {
        let newHeaders = this._copyHeaders();
        for(let key in values) {
            if(values.hasOwnProperty(key)) {
                newHeaders[key] = values[key];
            }
        }
        return new Plug(this.url.toString(), { headers: newHeaders });
    }
    withoutHeader(key) {
        let newHeaders = this._copyHeaders();
        delete newHeaders[key];
        return new Plug(this.url.toString(), { headers: newHeaders });
    }
    withHost(host) {
        this.url.withHost(host);
        return this;
    }
    get(verb = 'GET') {
        return this.getRaw(verb).then(_handleHttpError).then(_getText);
    }
    getRaw(verb = 'GET') {
        return _doRequest.call(this, { verb: verb });
    }
    post(value, mime) {
        return this.postRaw(value, mime).then(_handleHttpError).then(_getText);
    }
    postRaw(value, mime) {
        return _doRequest.call(this, { verb: 'POST', value: value, mime: mime });
    }
    put(value, mime) {
        return this.withHeader('X-HTTP-Method-Override', 'PUT').post(value, mime);
    }
    putRaw(value, mime) {
        return this.withHeader('X-HTTP-Method-Override', 'PUT').postRaw(value, mime);
    }
    head() {
        return this.get('HEAD');
    }
    headRaw() {
        return this.getRaw('HEAD');
    }
    options() {
        return this.get('OPTIONS');
    }
    optionsRaw() {
        return this.getRaw('OPTIONS');
    }
    del() {
        return this.withHeader('X-HTTP-Method-Override', 'DELETE').post(null, null);
    }
    delRaw() {
        return this.withHeader('X-HTTP-Method-Override', 'DELETE').postRaw(null, null);
    }
    delete() {
        return this.del();
    }
}
