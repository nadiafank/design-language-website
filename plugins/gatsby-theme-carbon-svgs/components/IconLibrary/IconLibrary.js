/* eslint-disable no-restricted-globals */
/* eslint-disable no-debugger */
import React, { useEffect, useState } from 'react';
import { pickBy, groupBy, debounce } from 'lodash-es';
import * as iconsReact from '@carbon/icons-react';

import iconMetaData from './iconMetaData';
import { svgPage, svgLibrary } from '../shared/SvgLibrary.module.scss';

import FilterRow from '../shared/FilterRow';
import IconCategory from './IconCategory';
import NoResult from '../shared/NoResult';

const IconLibrary = () => {
  const [iconComponents, setIconComponents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All icons');
  const [searchInputValue, setSearchInputValue] = useState('');
  const [categoryList, setCategoryList] = useState([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  const debouncedSetSearchInputValue = debounce(setSearchInputValue, 200);

  useEffect(() => {
    const iconComponentList = pickBy(
      iconsReact,
      (val, key) => key.slice(-2) === '32'
    );

    const iconArray = Object.keys(iconMetaData).map(icon => ({
      ...iconMetaData[icon],
      // If the icon is unprefixed and starts with a number, add an underscore
      Component:
        iconComponentList[isNaN(icon[0]) ? `${icon}32` : `_${icon}32`] ||
        iconComponentList[`WatsonHealth${icon}32`] ||
        iconComponentList[`Q${icon}32`],
    }));

    const filteredIconArray = iconArray.filter(({ deprecated }) => !deprecated);

    setCategoryList(
      Object.keys(groupBy(filteredIconArray, 'categories[0].name')).sort()
    );
    setCategoriesLoaded(true);

    setIconComponents(filteredIconArray);
  }, []);

  const getFilteredIcons = () => {
    if (!searchInputValue) {
      return iconComponents;
    }
    return iconComponents.filter(
      // eslint-disable-next-line camelcase
      ({ friendly_name, categories, aliases = [], name }) => {
        const searchValue = searchInputValue.toLowerCase();
        return (
          friendly_name.toLowerCase().includes(searchValue) ||
          aliases.some(alias =>
            alias
              .toString()
              .toLowerCase()
              .includes(searchValue)
          ) ||
          (categories &&
            categories[0] &&
            categories[0].name.toLowerCase().includes(searchValue)) ||
          (categories &&
            categories[0] &&
            categories[0].subcategory.toLowerCase().includes(searchValue)) ||
          name.toLowerCase().includes(searchValue)
        );
      }
    );
  };

  const filteredIcons = getFilteredIcons();

  const allCategories = Object.entries(
    groupBy(filteredIcons, 'categories[0].name')
  );

  const filteredCategories =
    selectedCategory === 'All icons'
      ? allCategories
      : allCategories.filter(([category]) => category === selectedCategory);

  const shouldShowNoResult = categoriesLoaded && filteredCategories.length < 1;

  return (
    <div className={svgPage}>
      <FilterRow
        categoryList={categoryList}
        selectedCategory={selectedCategory}
        onSearchChange={e =>
          debouncedSetSearchInputValue(e.currentTarget.value)
        }
        onDropdownChange={({ selectedItem }) =>
          setSelectedCategory(selectedItem)
        }
      />
      {shouldShowNoResult ? (
        <NoResult
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          allIconResults={filteredIcons.length}
          pageName="icon"
          pageUrl="https://github.com/carbon-design-system/carbon/blob/master/packages/icons/master/ui-icon-master.ai"
        />
      ) : (
        <div className={svgLibrary}>
          {filteredCategories.map(([category, icons]) => (
            <IconCategory key={category} category={category} icons={icons} />
          ))}
        </div>
      )}
    </div>
  );
};
export default IconLibrary;