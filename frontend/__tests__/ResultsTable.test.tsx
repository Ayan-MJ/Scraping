import React from 'react';
import { render, screen } from '@testing-library/react';
import { ResultsTable } from '@/components/results-viewer/ResultsTable';
import { Result } from '@/hooks/useResults';

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
    id: 1,
    run_id: 100,
    created_at: '2023-06-01T12:00:00Z',
    data: {
      url: 'https://example.com',
      title: 'Example Website',
      extracted_at: '2023-06-01T12:00:00Z',
      fields: {
        title: 'Example Page Title',
        price: '$99.99',
        description: 'This is a sample description',
      },
    },
  },
  {
    id: 2,
    run_id: 100,
    created_at: '2023-06-01T12:05:00Z',
    data: {
      url: 'https://test.com',
      title: 'Test Website',
      extracted_at: '2023-06-01T12:05:00Z',
      fields: {
        title: 'Test Page Title',
        price: '$149.99',
        description: 'This is another sample description',
      },
    },
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