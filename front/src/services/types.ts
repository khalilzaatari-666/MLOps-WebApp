export enum TrainingStatus {
  QUEUED = "QUEUED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED"
}

export enum SelectionMetric {
  accuracy = "accuracy",
  precision = "precision",
  recall = "recall"
}

export interface DatasetResponse {
  id: number;
  name: string;
  model: string;
  start_date: string;
  end_date: string;
  user_ids: number[];
  status: string;
  created_at: string;
}

export interface CreateDatasetRequest {
  model: string;
  start_date: string;
  end_date: string;
  user_ids: number[];
}

export interface ClientResponse {
  id: number;
  full_name: string;
  company_name: string;
}

export interface ImageResponse {
  id: number;
}

export interface ModelResponse {
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

interface SplitRatios {
  train?: number;
  val?: number;
  test?: number;
}
export interface HyperparameterConfig {
  epochs?: number;
  batch_size?: number;
  lr0?: number;
  lrf?: number;
  momentum?: number;
  weight_decay?: number;
  warmup_epochs?: number;
  warmup_momentum?: number;
  box?: number;
  cls?: number;
  dfl?: number;
}

export interface TrainingResponse {
  training_instance_id: number;
  task_ids: string[];
  status: string;
  message?: string;
  error?: string;
}

export interface TrainModelRequest {
  dataset_id: number;
  params_list: HyperparameterConfig[];
  split_ratios?: SplitRatios;
  use_gpu: boolean;
}

export interface TrainingTaskStatus {
  tasks_ids: string[];
  status: TrainingStatus;
  params: HyperparameterConfig;
  results?: Record<string, any>;
  error?: string;
  queue_position?: number;
  progress?: number;
  current_metrics?: {
    epoch?: number;
    "metrics/mAP50(B)"?: number;
    "metrics/mAP50-95(B)"?: number;
    "metrics/precision(B)"?: number;
    "metrics/recall(B)"?: number;
  };
  metrics_history?: Array<{
    epoch: number;
    "metrics/mAP50(B)"?: number;
    "metrics/mAP50-95(B)"?: number;
    "metrics/precision(B)"?: number;
    "metrics/recall(B)"?: number;
  }>;
  current_epoch?: number;
  total_epochs?: number;
  start_date?: string;
  end_date?: string;
}

export interface TrainingStatusResponse {
  dataset_id: number;
  status: TrainingStatus;
  progress: number;
  subtasks: Record<string, TrainingTaskStatus>;
  start_date?: string;
  end_date?: string;
  error?: string;
  message?: string;
}

export interface ModelSelectConfig {
  dataset_id: number;
  selection_metric: SelectionMetric;
  instance_id?: number;
}

export interface ModelSelectionResponse {
  status: 'success' | 'error';
  best_model: {
    id?: string | null;
    task_id: string;
    instance_id: number;
    dataset_id: number;
    model_path: string;
    params: HyperparameterConfig;
    score: number;
    metrics: SelectionMetric;
  }
  error?: string;
  message?: string;
}
