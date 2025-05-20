import React from 'react';
import { render, screen } from '@testing-library/react';
import { ResultsTable } from '@/app/results-viewer/[id]/_components/ResultsTable';
import type { Result } from '@/app/results-viewer/[id]/page';

// Mock TanStack Table
jest.mock('@tanstack/react-table', () => ({
  flexRender: (Component: any, props: any) => {
    if (typeof Component === 'string') return Component;
    return React.createElement(Component, props);
  },
  getCoreRowModel: () => ({}),
  getPaginationRowModel: () => ({}),
  getSortedRowModel: () => ({}),
  useReactTable: () => ({
    getHeaderGroups: () => [
      {
        id: 'headerGroup1',
        headers: [
          { id: 'id', column: { columnDef: { header: 'ID' }, getCanSort: () => true, getIsSorted: () => null } },
          { id: 'url', column: { columnDef: { header: 'URL' }, getCanSort: () => true, getIsSorted: () => null } },
          { id: 'title', column: { columnDef: { header: 'Title' }, getCanSort: () => true, getIsSorted: () => null } },
        ],
      },
    ],
    getRowModel: () => ({
      rows: [
        {
          id: 'row1',
          getVisibleCells: () => [
            { id: 'cell1', column: { columnDef: { cell: '1' } } },
            { id: 'cell2', column: { columnDef: { cell: 'https://example.com' } } },
            { id: 'cell3', column: { columnDef: { cell: 'Example' } } },
          ],
          getIsSelected: () => false,
        },
        {
          id: 'row2',
          getVisibleCells: () => [
            { id: 'cell4', column: { columnDef: { cell: '2' } } },
            { id: 'cell5', column: { columnDef: { cell: 'https://test.com' } } },
            { id: 'cell6', column: { columnDef: { cell: 'Test' } } },
          ],
          getIsSelected: () => false,
        },
      ],
    }),
    getCanPreviousPage: () => false,
    getCanNextPage: () => true,
    previousPage: jest.fn(),
    nextPage: jest.fn(),
    getAllColumns: () => [],
  }),
}));

// Sample results data
const mockResults: Result[] = [
  {
    id: "1",
    run_id: 101,
    data: { 
      url: "http://example.com/product/1", 
      title: "Product 1",
      extracted_at: new Date().toISOString(),
      fields: { 
        price: "$19.99", 
        image: "http://example.com/image1.jpg" 
      } 
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    run_id: 101,
    data: { 
      url: "http://example.com/product/2", 
      title: "Product 2", 
      extracted_at: new Date(Date.now() - 3600000).toISOString(),
      fields: { 
        price: "$29.99", 
        image: "http://example.com/image2.jpg" 
      }
    },
    created_at: new Date(Date.now() - 3600000).toISOString(), 
  },
];

describe('ResultsTable', () => {
  it('renders correctly with data', () => {
    render(<ResultsTable results={mockResults} />);
    
    // Check that headers are rendered
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('URL')).toBeInTheDocument();
    
    // Check for pagination buttons
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });
  
  it('displays loading state', () => {
    render(<ResultsTable results={[]} isLoading={true} />);
    expect(screen.getByText('Loading results...')).toBeInTheDocument();
  });
  
  it('displays empty state', () => {
    render(<ResultsTable results={[]} />);
    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });
}); 