/*
 *  Copyright 2016, Yahoo Inc.
 *  Licensed under the terms of the Apache License, Version 2.0.
 *  See the LICENSE file associated with the project for terms.
 */
import { test } from 'qunit';
import moduleForAcceptance from 'bullet-ui/tests/helpers/module-for-acceptance';
import RESULTS from '../fixtures/results';
import COLUMNS from '../fixtures/columns';
import { mockAPI, failAPI } from '../helpers/pretender';

let server;

moduleForAcceptance('Acceptance | query firing', {
  afterEach() {
    // Wipe out localstorage because we are creating here
    if (server) {
      server.shutdown();
    }
    window.localStorage.clear();
  }
});

test('query firing and redirecting to result', function(assert) {
  assert.expect(1);
  server = mockAPI(RESULTS.SINGLE, COLUMNS.BASIC);

  visit('queries/new');
  click('.submit-button');
  andThen(() => {
    assert.equal(currentRouteName(), 'result');
  });
});

test('query firing and result accessible through historical queries', function(assert) {
  let data;

  assert.expect(6);
  server = mockAPI(RESULTS.MULTIPLE, COLUMNS.BASIC);

  visit('queries/new');
  click('.submit-button');
  andThen(() => {
    assert.equal(currentRouteName(), 'result');
    data = find('pre').text();
  });
  visit('queries');
  andThen(() => {
    assert.equal(find('.queries-table .query-name-entry .query-description').length, 1);
    assert.notEqual(find('.queries-table .query-date-entry').text().trim(), '--');
    assert.equal(find('.queries-table .query-results-entry .length-entry').text().trim(), '1 Results');
  });
  click('.queries-table .query-results-entry');
  click('.result-date-entry');
  andThen(() => {
    assert.equal(currentRouteName(), 'result');
    assert.equal(find('pre').text(), data);
  });
});

test('query firing and redirecting to error', function(assert) {
  assert.expect(1);
  server = failAPI(COLUMNS.BASIC);
  visit('queries/new');
  click('.submit-button');
  andThen(() => {
    assert.equal(currentRouteName(), 'errored');
  });
});

test('creating, deleting query filters and raw data projections and saving', function(assert) {
  assert.expect(6);
  server = mockAPI(RESULTS.SINGLE, COLUMNS.BASIC);

  visit('/queries/new');
  click('.filter-container button[data-add=\'rule\']');
  click('.filter-container button[data-delete=\'rule\']');
  click('.filter-container button[data-add=\'rule\']');
  andThen(() => {
    find('.filter-container .rule-filter-container select').val('simple_column').trigger('change');
  });
  andThen(() => {
    fillIn('.filter-container .rule-value-container input', 'foo,bar');
    click('.output-container .raw-sub-options #select');
    click('.output-container .raw-sub-options .projections-container .add-projection');
    // Deletes everything
    click('.output-container .raw-sub-options #all');
    click('.output-container .raw-sub-options #select');
    click('.output-container .raw-sub-options .projections-container .add-projection');
    selectChoose('.output-container .raw-sub-options .projections-container .field-selection-container .field-selection', 'simple_column');
    click('.save-button');
    visit('queries');
    click('.queries-table .query-name-entry');
    andThen(() => {
      assert.equal(find('.filter-container .rule-filter-container select').val(), 'simple_column');
      assert.equal(find('.filter-container .rule-operator-container select').val(), 'equal');
      assert.equal(find('.filter-container .rule-value-container input').val(), 'foo,bar');
      assert.equal(find('.projections-container .column-onlyfield .ember-power-select-selected-item').text().trim(), 'simple_column');
      // Test that the projection name was autofilled
      assert.equal(find('.projections-container .field-name input').val(), 'simple_column');
      // Size field shown
      assert.equal(find('.aggregation-size').length, 1);
    });
  });
});

test('creating a query, adding filters and raw data projections, and save on submit', function(assert) {
  assert.expect(7);
  server = mockAPI(RESULTS.SINGLE, COLUMNS.BASIC);

  visit('/queries/new');
  click('.filter-container button[data-add=\'rule\']');
  andThen(() => {
    find('.filter-container .rule-filter-container select').val('simple_column').trigger('change');
  });
  andThen(() => {
    fillIn('.filter-container .rule-value-container input', 'foo,bar');
    click('.output-container .raw-sub-options #select');
    click('.output-container .raw-sub-options .projections-container .add-projection');
    selectChoose('.projections-container .field-selection-container .field-selection', 'complex_map_column.*');
    fillIn('.projections-container .field-selection-container .field-selection .column-subfield input', 'foo');
    triggerEvent('.projections-container .field-selection-container .field-selection .column-subfield input', 'blur');
    click('.submit-button');
    visit('queries');
    click('.queries-table .query-name-entry');
    andThen(() => {
      assert.equal(find('.filter-container .rule-filter-container select').val(), 'simple_column');
      assert.equal(find('.filter-container .rule-operator-container select').val(), 'equal');
      assert.equal(find('.filter-container .rule-value-container input').val(), 'foo,bar');
      assert.equal(find('.projections-container .column-mainfield .ember-power-select-selected-item').text().trim(), 'complex_map_column.*');
      assert.equal(find('.projections-container .field-selection-container .column-subfield input').val(), 'foo');
      // Test that the projection name was autofilled
      assert.equal(find('.projections-container .field-name input').val(), 'complex_map_column.foo');
      // Size field shown
      assert.equal(find('.aggregation-size').length, 1);
    });
  });
});

test('creating a query with a filter subfield column filled', function(assert) {
  assert.expect(4);
  server = mockAPI(RESULTS.RAW, COLUMNS.BASIC);

  visit('/queries/new');
  click('.filter-container button[data-add=\'rule\']');
  andThen(() => {
    find('.filter-container .rule-filter-container select').val('complex_map_column.*').trigger('change');
  });
  andThen(() => {
    fillIn('.filter-container .rule-subfield-container input', 'foo');
    fillIn('.filter-container .rule-value-container input', 'bar');
    click('.submit-button');
  });
  visit('queries');
  click('.queries-table .query-name-entry');
  andThen(() => {
    assert.equal(find('.filter-container .rule-filter-container select').val(), 'complex_map_column.*');
    assert.equal(find('.filter-container .rule-subfield-container input').val(), 'foo');
    assert.equal(find('.filter-container .rule-operator-container select').val(), 'equal');
    assert.equal(find('.filter-container .rule-value-container input').val(), 'bar');
  });
});

test('creating a query with a filter subfield column not filled', function(assert) {
  assert.expect(4);
  server = mockAPI(RESULTS.RAW, COLUMNS.BASIC);

  visit('/queries/new');
  click('.filter-container button[data-add=\'rule\']');
  andThen(() => {
    find('.filter-container .rule-filter-container select').val('complex_map_column.*').trigger('change');
  });
  fillIn('.filter-container .rule-value-container input', 'bar');
  click('.submit-button');
  visit('queries');
  click('.queries-table .query-name-entry');
  andThen(() => {
    assert.equal(find('.filter-container .rule-filter-container select').val(), 'complex_map_column.*');
    assert.equal(find('.filter-container .rule-subfield-container input').val(), '');
    assert.equal(find('.filter-container .rule-operator-container select').val(), 'equal');
    assert.equal(find('.filter-container .rule-value-container input').val(), 'bar');
  });
});

test('creating a query, adding count distinct output fields, and save on submit', function(assert) {
  assert.expect(5);
  server = mockAPI(RESULTS.COUNT_DISTINCT, COLUMNS.BASIC);

  visit('/queries/new');
  click('.output-container .count-distinct-option #count-distinct');
  click('.output-container .count-distinct-option .fields-selection-container .add-field');
  click('.output-container .count-distinct-option .fields-selection-container .add-field');
  selectChoose('.output-container .field-selection-container:eq(0) .field-selection', 'simple_column');
  selectChoose('.output-container .field-selection-container:eq(1) .field-selection', 'complex_map_column');
  fillIn('.output-container .count-distinct-display-name input', 'cnt');
  click('.submit-button');
  visit('queries');
  click('.queries-table .query-name-entry');
  andThen(() => {
    assert.equal(find('.count-distinct-option .field-selection-container:eq(0) .column-onlyfield .ember-power-select-selected-item').text().trim(), 'simple_column');
    assert.equal(find('.count-distinct-option .field-selection-container:eq(1) .column-onlyfield .ember-power-select-selected-item').text().trim(), 'complex_map_column');
    assert.equal(find('.count-distinct-option .count-distinct-display-name input').val(), 'cnt');
    // No names for fields for count distinct
    assert.equal(find('.count-distinct-option .field-selection-container .field-name').length, 0);
    // No size field shown
    assert.equal(find('.aggregation-size').length, 0);
  });
});

test('creating a query, adding groups and metrics for grouped data output fields, and save on submit', function(assert) {
  assert.expect(11);
  server = mockAPI(RESULTS.GROUP, COLUMNS.BASIC);

  visit('/queries/new');
  click('.output-container .group-option #grouped-data');
  click('.output-container .group-option .groups-container .add-group');
  click('.output-container .group-option .groups-container .add-group');
  selectChoose('.output-container .groups-container .field-selection-container:eq(0) .field-selection', 'complex_map_column');
  selectChoose('.output-container .groups-container .field-selection-container:eq(1) .field-selection', 'simple_column');
  fillIn('.output-container .groups-container .field-selection-container:eq(1) .field-name input', 'bar');

  click('.output-container .metrics-container .add-metric');
  click('.output-container .metrics-container .add-metric');
  selectChoose('.output-container .metrics-container .field-selection-container:eq(0) .metrics-selection', 'Count');
  selectChoose('.output-container .metrics-container .field-selection-container:eq(1) .metrics-selection', 'Average');
  selectChoose('.output-container .metrics-container .field-selection-container:eq(1) .field-selection', 'simple_column');
  fillIn('.output-container .metrics-container .field-selection-container:eq(1) .field-name input', 'avg_bar');

  click('.submit-button');
  visit('queries');
  click('.queries-table .query-name-entry');
  andThen(() => {
    // Name was autofilled for simple_column
    assert.equal(find('.group-option .groups-container .field-selection-container:eq(0) .column-onlyfield .ember-power-select-selected-item').text().trim(), 'complex_map_column');
    assert.equal(find('.group-option .groups-container .field-selection-container:eq(0) .field-name input').val(), 'complex_map_column');
    assert.equal(find('.group-option .groups-container .field-selection-container:eq(1) .column-onlyfield .ember-power-select-selected-item').text().trim(), 'simple_column');
    assert.equal(find('.group-option .groups-container .field-selection-container:eq(1) .field-name input').val(), 'bar');

    // No field and name for count
    assert.equal(find('.group-option .metrics-container .field-selection-container:eq(0) .metrics-selection .ember-power-select-selected-item').text().trim(), 'Count');
    assert.equal(find('.group-option .metrics-container .field-selection-container:eq(0) .field-selection').length, 0);
    assert.equal(find('.group-option .metrics-container .field-selection-container:eq(0) .field-name input').val(), '');

    assert.equal(find('.group-option .metrics-container .field-selection-container:eq(1) .metrics-selection .ember-power-select-selected-item').text().trim(), 'Average');
    assert.equal(find('.group-option .metrics-container .field-selection-container:eq(1) .field-selection .ember-power-select-selected-item').text().trim(), 'simple_column');
    assert.equal(find('.group-option .metrics-container .field-selection-container:eq(1) .field-name input').val(), 'avg_bar');

    // No size field shown
    assert.equal(find('.aggregation-size').length, 0);
  });
});
