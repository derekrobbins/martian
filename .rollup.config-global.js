import resolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';
import babel from 'rollup-plugin-babel';

const banner = `
/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015-present, MindTouch Inc.
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
 *
 * @preserve
 * @note this global bundle is an *experimental* feature, no support of any kind will be provided
 */
`;

export default {
    entry: './global.js',
    targets: [
        {
            dest: 'build/martian.min.js',
            format: 'iife',
            moduleName: 'MindTouch',
            banner
        }
    ],
    plugins: [
        resolve(),
        babel({
            babelrc: false,
            presets: [
                [ 'es2015', { modules: false } ]
            ],
            plugins: [ 'external-helpers' ]
        }),
        uglify({
            output: {
                comments: 'some'
            }
        })
    ],
    external: [ 'crypto' ]
};
