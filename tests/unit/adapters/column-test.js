/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { moduleFor, test } from 'ember-qunit';

moduleFor('adapter:column', 'Unit | Adapter | column', {
});

test('it does not background reload', function(assert) {
  let adapter = this.subject();
  assert.notOk(adapter.shouldBackgroundReloadAll());
});
