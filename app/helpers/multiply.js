/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import Ember from 'ember';

export function multiply(params) {
  return params.reduce((a, b) => a * b);
}

export default Ember.Helper.helper(multiply);
