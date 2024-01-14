import { useCallback, useEffect, useState } from "react";
import { Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel } from "@mui/material";
import { DataTable } from "../../models/data-table";

export default function SortingTable(props: {isLoading?: boolean, columns: string[], data: DataTable[], onClick?: (id: string) => void, selectedID: string, skeletonLoadingCount?: number, className?: string}) {
    const skeletonLoadingCount = props.skeletonLoadingCount || 5;
    const [orderBy, setOrderBy] = useState('');
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');

    useEffect(() => {
        setOrderBy(props.columns[0]);
    }, [props.columns]);

    const onClick = useCallback((selectedID: string, selected?: (id: string) => void) => {
        if (selected) {
            selected(selectedID);
        }
    }, []);

    const setSorting = useCallback((column: string) => {
        if (column === orderBy) {
            setOrder(order === 'asc' ? 'desc' : 'asc');
        }
        setOrderBy(column);
    }, [order, orderBy]);

    const dataSorting = useCallback((data: DataTable[]) => {
        const columnIndex = props.columns.findIndex(column => column === orderBy);
        if (columnIndex === -1) {
            return data;
        }
        return data.sort((a, b) => {
            const data1 = a.data[columnIndex]!.toString();
            const data2 = b.data[columnIndex]!.toString();
            return order === 'asc' ? data1.localeCompare(data2) : data2.localeCompare(data1);
        });
    }, [props.columns, order, orderBy]);

    return (
        <TableContainer component={Paper} className={props.className}>
            <Table stickyHeader aria-label="sorting table">
                <TableHead>
                    <TableRow>
                        {props.columns.map((column, index) => {
                            return (
                                <TableCell
                                    key={index}
                                    align='left'
                                    sortDirection={'asc'}
                                >
                                    <TableSortLabel
                                        active={orderBy === column}
                                        direction={orderBy === column ? order : 'asc'}
                                        onClick={() => setSorting(column)}
                                    >
                                        { column }
                                    </TableSortLabel>
                                </TableCell>
                            );
                        })}
                    </TableRow>
                </TableHead>

                <TableBody>
                    {props.isLoading && [...Array(skeletonLoadingCount)].map((_, index) => {
                        return (
                            <TableRow key={index}>
                                {props.columns.map((_, index) => {
                                    return (
                                        <TableCell key={index} component="th" scope="row">
                                            <Skeleton animation="wave" variant="text" />
                                        </TableCell>
                                    )
                                })}
                            </TableRow>
                        )
                    })}

                    {!props.isLoading && props.data.length === 0 && <TableRow>
                        <TableCell colSpan={props.columns.length}><div className="text-center">NO DATA</div></TableCell>
                    </TableRow>}

                    {!props.isLoading && props.data.length > 0 && dataSorting(props.data).map((row, index) => {
                        return (
                            <TableRow
                                key={index}
                                component={'tr'}
                                hover
                                onClick={() => onClick(row.id, props.onClick)}
                                selected={props.selectedID === row.id}
                                className="cursor-pointer"
                            >
                                {row.data.map((data, index) => {
                                    return (
                                        <TableCell key={index} component="th" scope="row">{ data }</TableCell>
                                    )
                                })}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
