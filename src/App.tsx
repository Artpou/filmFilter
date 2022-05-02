import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { useTable } from 'react-table';
import ReactPaginate from 'react-paginate';

import './App.css';
import { filmResponseType } from './types/reponseType';

export interface ColumnSort {
  accessor: string,
  isSortedDesc: boolean,
}

function Table({data, sort, setSort}: {data: Array<any>, sort: ColumnSort|null, setSort: Dispatch<SetStateAction<ColumnSort|null>>}) {

  function handleColumnClick(columnAccessor: any) {

    if (sort?.accessor === columnAccessor) {

      if (sort?.isSortedDesc) {
        setSort({
          accessor: columnAccessor,
          isSortedDesc: false,
        });
      } else {
        setSort(null);
      }

    } else {
      setSort({
        accessor: columnAccessor,
        isSortedDesc: true,
      });
    }
  }

  const columns = useMemo(
    () => [
      {
        Header: 'Title',
        accessor: 'title', // accessor is the "key" in the data
        canFilter: true,
      },
      {
        Header: 'Genre',
        accessor: 'name',
        canFilter: true,
      },
      {
        Header: 'Rating',
        accessor: 'rating',
        canFilter: false,
      },
      {
        Header: 'Rental Rate',
        accessor: 'rental_rate',
        canFilter: false,
      },
      {
        Header: 'Rental',
        accessor: 'nb_rental',
        canFilter: true,
      }
    ],
    []
  );
 
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
    }
  )

  // Render the UI for your table
  return (
   <table {...getTableProps()}>
     <thead>
       {// Loop over the header rows
       headerGroups.map(headerGroup => (
         // Apply the header row props
         <tr {...headerGroup.getHeaderGroupProps()}>
           {// Loop over the headers in each row
           headerGroup.headers.map(column => (
             // Apply the header cell props
             <th
              {...column.getHeaderProps()}
               onClick={() => column.canFilter && handleColumnClick(column.id)}
             >
               {// Render the header
               column.render('Header')}
               <span>
                {column.id === sort?.accessor ? (sort?.isSortedDesc ? '🔼' : '🔽') : ''}
               </span>
             </th>
           ))}
         </tr>
       ))}
     </thead>
     {/* Apply the table body props */}
     <tbody {...getTableBodyProps()}>
       {// Loop over the table hrows
       rows.map(row => {
         // Prepare the row for display
         prepareRow(row)
         return (
           // Apply the row props
           <tr {...row.getRowProps()}>
             {// Loop over the rows cells
             row.cells.map(cell => {
               // Apply the cell props
               return (
                 <td {...cell.getCellProps()}>
                   {// Render the cell contents
                    cell.render('Cell')
                  }
                  {cell.column.id === 'rental_rate' && (' $')}
                 </td>
               )
             })}
           </tr>
         )
       })}
     </tbody>
   </table>
  )
}

interface FilmsUrlParams {
  page: string,
  itemPerPage: string,
  sort?: string,
  sortDir?: string
}

function App() {

  const CURRENT_PAGE_DEFAULT = 1;
  const ITEMS_PER_PAGE_DEFAULT = 10;
  const DEFAULT_URL = process.env.REACT_APP_API_URL ?? "";

  const itemsPerPageOptions = [
    { value: ITEMS_PER_PAGE_DEFAULT, label: '10' },
    { value: 20, label: '20' },
    { value: 50, label: '50' },
    { value: 100, label: '100' },
  ];

  const [films, setFilms] = useState<filmResponseType>();
  const [sort, setSort] = useState<ColumnSort|null>(null);
  const [itemsPerPage, setItemsPerPage] = useState<number>(ITEMS_PER_PAGE_DEFAULT);
  const [currentPage, setcurrentPage] = useState(CURRENT_PAGE_DEFAULT);

  function fetchFilms(url: string, params: FilmsUrlParams) {
    const urlParams = new URLSearchParams(Object(params));
    console.log(DEFAULT_URL);
    console.log(urlParams.toString());

    fetch(url + "?" + urlParams)
    .then(response => response.json())
    .then((body: filmResponseType) => {
      setFilms(body);
    })
    .catch(error => console.error('Error', error));
  }

  useEffect(() => {    
    let params: FilmsUrlParams = {page: String(currentPage), itemPerPage: String(itemsPerPage)};
    if (sort) {
      params.sort = sort.accessor;
      params.sortDir = sort.isSortedDesc ? 'ASC' : 'DESC';
    }
    
    fetchFilms(DEFAULT_URL, params);
  }, [currentPage, sort, itemsPerPage]);

  const handlePageChange = (selectedObject: any) => {
    setcurrentPage(selectedObject.selected + 1);
  };

  return (
    <div className="App">
      <div>Films : {films?.totalItems}</div>
      <div>
        Films per page : 

        <select name="itemsPerPage" id="itemsPerPage-select" value={itemsPerPage} onChange={(event) => setItemsPerPage(+event.target.value)}>
          {itemsPerPageOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      	{films && (
          <div style={{overflowX: 'auto'}}>
              <Table
              data={films.data}
              sort={sort}
              setSort={setSort}
              />
            </div>
			)} 

			{films ? (
				<ReactPaginate
          breakLabel="..."
          nextLabel=">"
          onPageChange={handlePageChange}
          pageCount={films.totalPages}
					marginPagesDisplayed={2}
          previousLabel="<"
          containerClassName={'container'}
          previousLinkClassName={'page'}
					breakClassName={'page'}
					nextLinkClassName={'page'}
					pageClassName={'page'}
					disabledClassName={'disabled'}
					activeClassName={'active'}
				/>
			) : (
				<div>Nothing to display</div>
			)}         
    </div>
  );
}

export default App;
