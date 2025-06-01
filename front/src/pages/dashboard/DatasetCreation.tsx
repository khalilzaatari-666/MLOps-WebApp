import React, { useState, useEffect, useMemo } from 'react';
import { getClients, createDataset, listDatasets } from '../../services/fastApi';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { CheckCheck, CalendarIcon, Database, FileSpreadsheet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";

interface Client {
  id: number;
  full_name: string;
  company_name: string;
}

interface Dataset {
  id: number;
  name: string;
  model: string;
  start_date: string;
  end_date: string;
  created_at: string;
  status: string;
  count: number;
}

const DatasetCreation: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [start_date, setStartDate] = useState<Date | undefined>(undefined);
  const [end_date, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedClients, setSelectedClients] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingDatasets, setLoadingDatasets] = useState(true);
  const [sortConfig, setSortConfig] = useState({key: 'created_at', direction:'desc',})

  const today = new Date();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingDatasets(true);
        const [clientsData, datasetsData] = await Promise.all([
          getClients(),
          listDatasets()
        ]);
        
        setClients(clientsData);
        setDatasets(datasetsData);
      } catch (error) {
        toast({
          title: "Error",
          description: 'Failed to fetch data'
        });
        console.error(error);
      } finally {
        setLoading(false);
        setLoadingDatasets(false);
      }
    };

    fetchData();
  }, []);

  const handleToggleClient = (clientId: number) => {
    if (selectedClients.includes(clientId)) {
      setSelectedClients(selectedClients.filter(id => id !== clientId));
    } else {
      setSelectedClients([...selectedClients, clientId]);
    }
  };

  const handleToggleAll = () => {
    if (selectAll || selectedClients.length === clients.length) {
      setSelectedClients([]);
      setSelectAll(false);
    } else {
      setSelectedClients(clients.map(client => client.id));
      setSelectAll(true);
    }
  };

  const handleCreateDataset = async () => {
    if (!selectedGroup) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select a model"
      });
      return;
    }
    
    if (!start_date || !end_date) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select both start and end dates"
      });
      return;
    }
    
    if (start_date > end_date) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Start date cannot be after end date"
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const clientIds = selectedClients.length === 0 
        ? clients.map(client => client.id)
        : selectedClients;

      const formatDate = (date: Date) => date.toISOString().split("T")[0];
      
      await createDataset({
        model: selectedGroup,
        start_date: formatDate(start_date),
        end_date: formatDate(end_date), 
        user_ids: clientIds
      });
      
      toast({
        title: "Success",
        description: "Dataset created successfully"
      });
      
      const newDatasets = await listDatasets();
      setDatasets(newDatasets);
      
      setSelectedGroup('');
      setStartDate(undefined);
      setEndDate(undefined);
      setSelectedClients([]);
      setSelectAll(false);
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create dataset"
      });
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedDatasets = useMemo(() => {
    const sortableItems = [...datasets];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
      if (sortConfig.key === 'created_at') {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        } else if (sortConfig.key === 'count') {
          return sortConfig.direction === 'asc' 
            ? a.count - b.count 
            : b.count - a.count;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [datasets, sortConfig]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VALIDATED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'RAW':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'AUTO_ANNOTATED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'AUGMENTED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    if (date > today) {
      toast({
        title: "Invalid Date",
        description: "End date cannot be in the future",
        variant: "destructive",
      });
      return;
    }
    
    if (start_date && date < start_date) {
      toast({
        title: "Invalid Date",
        description: "End date cannot be before start date",
        variant: "destructive",
      });
      return;
    }
    
    setEndDate(date);
  };
  
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };  

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create New Dataset</h1>
        <p className="text-gray-500">Fill in the details to create a new dataset for training</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dataset Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="group" className="text-sm font-medium">
                  Vegetable/Fruit group
                </label>
                <Select
                  value={selectedGroup}
                  onValueChange={setSelectedGroup}
                >
                  <SelectTrigger id="model">
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='melon, pasteque, concombre, courgette, pg_cucurbit, artichaut'>Melon, Watermelon, Cucumber, Zucchini, Cucurbit, Artichoke</SelectItem>
                    <SelectItem value='tomate, aubergine, poivron'>Tomato, Eggplant, Bell Pepper</SelectItem>
                    <SelectItem value='poireau'>Leek</SelectItem>
                    <SelectItem value='radis, choux de bruxelles'>Radish, Brussels Sprouts</SelectItem>
                    <SelectItem value='haricot'>Bean</SelectItem>
                    <SelectItem value='salad'>Salad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Start Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !start_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {start_date ? format(start_date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={start_date}
                      onSelect={setStartDate}
                      disabled={(date) => date > today}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  End Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !end_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {end_date ? format(end_date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={end_date}
                      onSelect={handleEndDateSelect}
                      disabled={(date) => date > today}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Client Selection</CardTitle>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="selectAll"
                checked={selectAll || (clients.length > 0 && selectedClients.length === clients.length)}
                onCheckedChange={handleToggleAll}
              />
              <label htmlFor="selectAll" className="text-sm">
                {selectAll || (clients.length > 0 && selectedClients.length === clients.length)
                  ? "Deselect All"
                  : "Select All"}
              </label>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center">Loading clients...</div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Client Name</TableHead>
                      <TableHead>Company Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.length > 0 ? (
                      clients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell className="px-4">
                            <Checkbox
                              checked={selectedClients.includes(client.id)}
                              onCheckedChange={() => handleToggleClient(client.id)}
                            />
                          </TableCell>
                          <TableCell>{client.full_name}</TableCell>
                          <TableCell>{client.company_name}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4">
                          No clients found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-4">
              Note: If no clients are selected, all clients will be included
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-center">
        <Button 
          onClick={handleCreateDataset} 
          disabled={submitting || loading} 
          className="px-8 py-6 text-lg bg-gradient-green hover:shadow-green transition-all"
        >
          {submitting ? "Creating..." : "Create Dataset"}
        </Button>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-green-600" />
            Available Datasets
          </CardTitle>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {datasets.length} Datasets
          </Badge>
        </CardHeader>
        <CardContent>
          {loadingDatasets ? (
            <div className="py-8 text-center">Loading datasets...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Name</TableHead>
                    <TableHead className="text-center">Model</TableHead>
                    <TableCell 
                      onClick={() => requestSort('created_at')}
                      style={{ cursor: 'pointer' }}
                      className="text-center"
                    >
                      Created At
                      {sortConfig.key === 'created_at' && (
                        sortConfig.direction === 'asc' ? ' ↑' : ' ↓'
                      )}
                    </TableCell>
                    <TableHead className="text-center">Date Range</TableHead>
                    <TableCell 
                      onClick={() => requestSort('count')}
                      style={{ cursor: 'pointer' }}
                      className="text-center"
                    >
                      Image Count
                      {sortConfig.key === 'count' && (
                        sortConfig.direction === 'asc' ? ' ↑' : ' ↓'
                      )}
                    </TableCell>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedDatasets.length > 0 ? (
                    sortedDatasets.map((dataset) => (
                      <TableRow key={dataset.id}>
                        <TableCell className="text-center align-middle">
                          <div className='flex items-center justify-center gap-2'>
                            <FileSpreadsheet className="h-4 w-4 text-gray-500" />
                            {dataset.name}
                          </div>
                        </TableCell>
                        <TableCell>{dataset.model}</TableCell>
                        <TableCell className="text-center align-middle">{format(new Date(dataset.created_at), 'PPP')}</TableCell>
                        <TableCell className="text-center align-middle">
                          {formatDate(dataset.start_date)} - {formatDate(dataset.end_date)}
                        </TableCell>
                        <TableCell className="text-center align-middle">{dataset.count}</TableCell>
                        <TableCell className="text-center align-middle">
                          <Badge className={cn("font-normal capitalize", getStatusColor(dataset.status))}>
                            {dataset.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No datasets available. Create your first dataset above.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {submitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-md p-6 shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-medium mb-2 text-center">Dataset creation in progress</h3>
            <div className="flex justify-center my-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Please wait while the images are being downloaded downloaded (Waiting time depends on your internet speed, number of images and images size)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatasetCreation;