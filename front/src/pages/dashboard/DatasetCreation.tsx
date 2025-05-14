import React, { useState, useEffect } from 'react';
import { getClients, listModels, createDataset } from '../../services/fastApi';
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
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CheckCheck, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Client {
  id: number;
  full_name: string;
  company_name: string;
}

interface Model {
  id: number;
  name: string;
  model_type: string;
  model_path: string;
  input_size: number;
  class_names: string[];
  device: string;
  is_active: boolean;
  last_used: string;
}

const DatasetCreation: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [start_date, setStartDate] = useState<Date | undefined>(undefined);
  const [end_date, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedClients, setSelectedClients] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Get current date (for date picker max value)
  const today = new Date();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [clientsData, modelsData] = await Promise.all([
          getClients(),
          listModels()
        ]);
        
        setClients(clientsData);
        setModels(modelsData);
      } catch (error) {
        toast.error('Failed to fetch data');
        console.error(error);
      } finally {
        setLoading(false);
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
    // Validate form
    if (!selectedGroup) {
      toast.error('Please select a group');
      return;
    }
    
    if (!start_date || !end_date) {
      toast.error('Please select both start and end dates');
      return;
    }
    
    if (start_date > end_date) {
      toast.error('Start date cannot be after end date');
      return;
    }

    try {
      setSubmitting(true);
      
      // If no clients are selected, select all
      const clientIds = selectedClients.length === 0 
        ? clients.map(client => client.id)
        : selectedClients;
      
      await createDataset({
        model: selectedGroup,
        start_date: start_date.toISOString(),
        end_date: end_date.toISOString(),
        user_ids: clientIds
      });
      
      toast.success('Dataset created successfully', {
        icon: <CheckCheck className="h-4 w-4" />,
      });
      
      // Reset form
      setSelectedGroup('');
      setStartDate(undefined);
      setEndDate(undefined);
      setSelectedClients([]);
      setSelectAll(false);
      
    } catch (error) {
      toast.error('Failed to create dataset');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
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
                    <SelectItem value="melon, pasteque, concombre, courgette, pg_cucurbit, artichaut">Melon, Watermelon, Cucumber, Zucchini, Cucurbit, Artichoke</SelectItem>
                    <SelectItem value="tomate, aubergine, poivron">Tomato, Eggplant, Bell Pepper</SelectItem>
                    <SelectItem value="poireau">Leek</SelectItem>
                    <SelectItem value="radis, choux de bruxelles">Radish, Brussels Sprouts</SelectItem>
                    <SelectItem value="haricot">Bean</SelectItem>
                    <SelectItem value="salad">Salad</SelectItem>
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
                      onSelect={setEndDate}
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
    </div>
  );
};

export default DatasetCreation;
