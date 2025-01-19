import React, { useState, useEffect, useCallback, useMemo } from 'react';
import debounce from 'lodash.debounce';
import classNames from 'classnames';
import 'bulma';

import './App.scss';
import { peopleFromServer } from './data/people';
import { Person } from './types/Person';
import { DropdownMenu } from './components/DropdownMenu';

export const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [title, setTitle] = useState('No selected person');

  const applyQuery = useCallback(debounce(setAppliedQuery, 300), []);

  useEffect(() => {
    if (selectedPerson && query === selectedPerson.name) {
      setTitle(
        `${selectedPerson.name} (${selectedPerson.born} - ${selectedPerson.died})`,
      );
    } else {
      setTitle('No selected person');
    }
  }, [selectedPerson, query]);

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    applyQuery(event.target.value);
  };

  const handleClearInput = () => {
    setQuery('');
    setSelectedPerson(null);
    applyQuery('');
  };

  const filteredNames = useMemo(() => {
    return peopleFromServer.filter(person =>
      person.name.toLowerCase().includes(appliedQuery.trim().toLowerCase()),
    );
  }, [appliedQuery]);

  const onSelected = (person: Person) => {
    setSelectedPerson(person);
    setQuery(person.name);
    setIsFocused(false);
  };

  return (
    <div className="container">
      <main className="section is-flex is-flex-direction-column">
        <h1 className="title" data-cy="title">
          {title}
        </h1>

        <div
          className={classNames('dropdown', {
            'is-active': isFocused && filteredNames.length > 0,
          })}
        >
          <div className="dropdown-trigger field has-addons">
            <div className="control is-expanded">
              <input
                type="text"
                placeholder="Enter a part of the name"
                className="input"
                data-cy="search-input"
                value={query}
                onChange={handleQueryChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
            </div>
            {query && (
              <div className="control">
                <button
                  className="button is-light"
                  onClick={handleClearInput}
                  data-cy="clear-button"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          <DropdownMenu filteredNames={filteredNames} onSelected={onSelected} />
        </div>

        {filteredNames.length === 0 && (
          <div
            className="
            notification
            is-danger
            is-light
            mt-3
            is-align-self-flex-start
          "
            role="alert"
            data-cy="no-suggestions-message"
          >
            <p className="has-text-danger">No matching suggestions</p>
          </div>
        )}
      </main>
    </div>
  );
};
