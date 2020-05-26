import { Grid, GridList, GridListTile, TextField } from '@material-ui/core';

import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import PropTypes from 'prop-types';
import React, { useRef, useState, useEffect } from 'react';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';

export const defaultFilterStyles = theme => ({
  root: {
    backgroundColor: theme.palette.background.default,
    padding: '24px 24px 36px 24px',
    fontFamily: 'Roboto',
  },
  header: {
    flex: '0 0 auto',
    marginBottom: '16px',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
  },
  title: {
    display: 'inline-block',
    marginLeft: '7px',
    color: theme.palette.text.primary,
    fontSize: '14px',
    fontWeight: 500,
  },
  noMargin: {
    marginLeft: '0px',
  },
  reset: {
    alignSelf: 'left',
  },
  resetLink: {
    marginLeft: '16px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  filtersSelected: {
    alignSelf: 'right',
  },
  /* checkbox */
  checkboxListTitle: {
    marginLeft: '7px',
    marginBottom: '8px',
    fontSize: '14px',
    color: theme.palette.text.secondary,
    textAlign: 'left',
    fontWeight: 500,
  },
  checkboxFormGroup: {
    marginTop: '8px',
  },
  checkboxFormControl: {
    margin: '0px',
  },
  checkboxFormControlLabel: {
    fontSize: '15px',
    marginLeft: '8px',
    color: theme.palette.text.primary,
  },
  checkboxIcon: {
    width: '32px',
    height: '32px',
  },
  checkbox: {
    '&$checked': {
      color: theme.palette.primary.main,
    },
  },
  checked: {},
  gridListTile: {
    marginTop: '16px',
  },
});

function TableFilter({
  classes,
  columns,
  options,
  onFilterReset,
  customFooter,
  filterList,
  onFilterUpdate,
  filterData,
  onFilterApply,
}) {
  const textLabels = options.textLabels.filter;
  const filterGridColumns = columns.filter(col => col.filter).length === 1 ? 1 : 2;

  const [filters, setFilters] = useState([]);
  const [reset, setReset] = useState(false);

  useEffect(
    () => {
      const state = columns.reduce(
        (p, n, i) => ({ ...p, [i]: { filter: filterList[i], column: n, type: n.filterType || options.filterType } }),
        {},
      );
      setFilters(state);
    },
    [filterList, columns],
  );

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <div className={classes.reset}>
          <Typography
            variant="body2"
            className={classNames({
              [classes.title]: true,
            })}>
            {textLabels.title}
          </Typography>
          <Button
            color="primary"
            className={classes.resetLink}
            tabIndex={0}
            aria-label={textLabels.reset}
            data-testid={'filterReset-button'}
            onClick={() => {
              Object.keys(filters).forEach(i => {
                const filter = filters[i];

                if (filter.filter === filterList[i] && filter.type != 'custom') return;
                onFilterUpdate(i, filter.filter, filter.column, filter.type);
              });

              onFilterApply();
            }}>
            Apply
          </Button>
          <Button
            color="primary"
            className={classes.resetLink}
            tabIndex={0}
            aria-label={textLabels.reset}
            data-testid={'filterReset-button'}
            onClick={onFilterReset}>
            {textLabels.reset}
          </Button>
        </div>
        <div className={classes.filtersSelected} />
      </div>
      <GridList cellHeight="auto" cols={filterGridColumns} spacing={34}>
        {Object.keys(filters).map(i => {
          const { filter, column } = filters[i];

          if (column.filter) {
            const filterType = column.filterType || options.filterType;
            return filterType === 'checkbox' ? (
              <div key={i}>
                <RenderCheckBox
                  options={options}
                  filterData={filterData[i]}
                  value={filter}
                  column={column}
                  classes={classes}
                  filterList={filterList}
                  index={i}
                  onFilterUpdate={value => setFilters({ ...filters, [i]: { ...filters[i], filter: value } })}
                />
              </div>
            ) : filterType === 'multiselect' ? (
              <div key={i}>
                <RenderMultiselect
                  options={options}
                  filterData={filterData[i]}
                  value={filter || []}
                  column={column}
                  classes={classes}
                  filterList={filterList}
                  index={i}
                  onFilterUpdate={value => setFilters({ ...filters, [i]: { ...filters[i], filter: value } })}
                />
              </div>
            ) : filterType === 'textField' ? (
              <div key={i}>
                <RenderTextField
                  value={filter.toString() || ''}
                  column={column}
                  classes={classes}
                  filterList={filterList}
                  index={i}
                  onFilterUpdate={value => setFilters({ ...filters, [i]: { ...filters[i], filter: value } })}
                />
              </div>
            ) : filterType === 'custom' ? (
              <div key={i}>
                <RenderCustomField
                  index={i}
                  filterList={filterList}
                  options={options}
                  filterData={filterData[i]}
                  value={filter || []}
                  column={column}
                  classes={classes}
                  filterList={filterList}
                  index={i}
                  onFilterUpdate={value => setFilters({ ...filters, [i]: { ...filters[i], filter: value } })}
                />
              </div>
            ) : (
              <div key={i}>
                <RenderSelect
                  options={options}
                  filterData={filterData[i]}
                  value={filter.length ? filter.toString() : textLabels.all}
                  column={column}
                  classes={classes}
                  filterList={filterList}
                  index={i}
                  onFilterUpdate={value => setFilters({ ...filters, [i]: { ...filters[i], filter: value } })}
                />
              </div>
            );
          }
        })}
      </GridList>
      {customFooter ? customFooter(filterList) : ''}
    </div>
  );
}

function RenderSelect({ value, classes, column, onFilterUpdate, filterData, options }) {
  const textLabels = options.textLabels.filter;

  const handleDropdownChange = event => {
    const labelFilterAll = options.textLabels.filter.all;
    const value = event.target.value === labelFilterAll ? [] : [event.target.value];
    onFilterUpdate(value);
  };

  return (
    <GridListTile cols={1} classes={{ tile: classes.gridListTile }}>
      <FormControl fullWidth>
        <InputLabel htmlFor={column.name}>{column.label}</InputLabel>
        <Select
          fullWidth
          value={value}
          name={column.name}
          onChange={event => handleDropdownChange(event)}
          input={<Input name={column.name} id={column.name} />}>
          <MenuItem value={textLabels.all} key={0}>
            {textLabels.all}
          </MenuItem>
          {filterData.map((filterValue, filterIndex) => (
            <MenuItem value={filterValue} key={filterIndex + 1}>
              {filterValue != null ? filterValue.toString() : ''}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </GridListTile>
  );
}

function RenderCustomField({ index, filterList, value, classes, column, onFilterUpdate, filterData, options }) {
  const display =
    (column.filterOptions && column.filterOptions.display) || (options.filterOptions && options.filterOptions.display);

  if (!display) {
    console.error('Property "display" is required when using custom filter type.');
    return;
  }
  return (
    <GridListTile cols={1} classes={{ tile: classes.gridListTile }}>
      {display(
        filterList,
        value => {
          onFilterUpdate(value);
          console.log(value);
        },
        index,
        column,
      )}
    </GridListTile>
  );
}

function RenderTextField({ value, classes, column, index, onFilterUpdate }) {
  return (
    <GridListTile key={index} cols={1} classes={{ tile: classes.gridListTile }}>
      <FormControl key={index} fullWidth>
        <TextField
          fullWidth
          label={column.label}
          value={value}
          onChange={event => onFilterUpdate(event.target.value)}
        />
      </FormControl>
    </GridListTile>
  );
}

function RenderMultiselect({ value, classes, column, onFilterUpdate, filterData, options }) {
  return (
    <GridListTile cols={1} classes={{ tile: classes.gridListTile }}>
      <FormControl fullWidth>
        <InputLabel htmlFor={column.name}>{column.label}</InputLabel>
        <Select
          multiple
          fullWidth
          value={value}
          renderValue={selected => selected.join(', ')}
          name={column.name}
          onChange={event => onFilterUpdate(event.target.value)}
          input={<Input name={column.name} id={column.name} />}>
          {filterData.map((filterValue, filterIndex) => (
            <MenuItem value={filterValue} key={filterIndex + 1}>
              <Checkbox
                checked={value.indexOf(filterValue) >= 0 ? true : false}
                value={filterValue != null ? filterValue.toString() : ''}
                className={classes.checkboxIcon}
                classes={{
                  root: classes.checkbox,
                  checked: classes.checked,
                }}
              />
              <ListItemText primary={filterValue} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </GridListTile>
  );
}

function RenderCheckBox({ value, classes, column, onFilterUpdate, filterData, options }) {
  return (
    <GridListTile cols={2}>
      <FormGroup>
        <Grid item xs={12}>
          <Typography variant="body2" className={classes.checkboxListTitle}>
            {column.label}
          </Typography>
        </Grid>
        <Grid container>
          {filterData.map((filterValue, filterIndex) => (
            <Grid item key={filterIndex}>
              <FormControlLabel
                key={filterIndex}
                classes={{
                  root: classes.checkboxFormControl,
                  label: classes.checkboxFormControlLabel,
                }}
                control={
                  <Checkbox
                    className={classes.checkboxIcon}
                    onChange={() => {
                      const updated = value;
                      const index = value.indexOf(filterValue);
                      if (index >= 0) {
                        updated.splice(index, 1);
                      } else {
                        updated.push(filterValue);
                      }
                      onFilterUpdate(updated);
                    }}
                    checked={value && value.indexOf(filterValue) >= 0 ? true : false}
                    classes={{
                      root: classes.checkbox,
                      checked: classes.checked,
                    }}
                    value={filterValue != null ? filterValue.toString() : ''}
                  />
                }
                label={filterValue}
              />
            </Grid>
          ))}
        </Grid>
      </FormGroup>
    </GridListTile>
  );
}

export default withStyles(defaultFilterStyles, { name: 'MUIDataTableFilter' })(TableFilter);
