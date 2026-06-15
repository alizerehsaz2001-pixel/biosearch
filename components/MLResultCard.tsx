import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Cpu, Copy, Check, Terminal, Layers, Settings, BrainCircuit, Activity, 
  GitBranch, Database, BarChart, Download, Zap, ShieldCheck, Play, Pause, 
  RotateCcw, Sliders, Info, Server, LineChart, FileText, ExternalLink, 
  HelpCircle, ChevronRight, Code, ArrowRight
} from 'lucide-react';
import { SearchResult } from '../types';
import MermaidDiagram from './MermaidDiagram';
import { jsPDF } from 'jspdf';

interface MLResultCardProps {
  result: SearchResult;
}

interface ArchitectureComponent {
  name: string;
  type: string;
  description: string;
  details: string;
}

interface PipelineStrategy {
  preprocessing: string[];
  loss_function: string;
  metrics: string[];
  interpretability?: string;
}

interface TrainingConfig {
  batch_size: string;
  learning_rate: string;
  optimizer: string;
  epochs: string;
}

interface MLArchitectureData {
  model_name: string;
  reasoning: string;
  architecture_components: ArchitectureComponent[];
  mermaid_diagram: string;
  pipeline_strategy: PipelineStrategy;
  uncertainty_quantification?: string;
  training_config?: TrainingConfig;
  deployment_hints?: string;
  hardware_requirements?: string;
  implementation_code: string;
}

// Custom code generation helper to match user configurations
const generateDymamicCode = (
  modelName: string,
  framework: 'pytorch' | 'lightning' | 'keras',
  part: 'dataset' | 'model' | 'training_loop' | 'inference',
  dataType: string,
  vramDetails: any,
  trainingConfig: any
) => {
  const normalizedName = modelName.replace(/[^a-zA-Z0-9]/g, '');
  const lrVal = trainingConfig.learning_rate || '1e-4';
  const batchVal = trainingConfig.batch_size || '32';
  const optVal = trainingConfig.optimizer || 'AdamW';

  if (framework === 'pytorch') {
    if (part === 'dataset') {
      return `import torch
from torch.utils.data import Dataset, DataLoader
import numpy as np

class Biomedical${dataType === 'image_3d' ? '3DVolume' : dataType === 'image_2d' ? 'Image' : 'Sequence'}Dataset(Dataset):
    """
    Expert Bio-AI Loader for high-fidelity ${dataType} loading.
    Configured for medical scans / sequence-based preprocessing.
    """
    def __init__(self, data_paths, labels=None, transform=None):
        self.data_paths = data_paths
        self.labels = labels
        self.transform = transform
        
    def __len__(self):
        return len(self.data_paths)
        
    def __getitem__(self, idx):
        # 1. Load biological raw signals
        # In production, replace with nibabel / pydicom / Biopython readers
        path = self.data_paths[idx]
        
        # Simulated raw structured array based on target parameters
        raw_signal = np.random.randn(${dataType === 'image_3d' ? '16, 256, 256' : dataType === 'image_2d' ? '3, 512, 512' : '1024'})
        
        # 2. Apply medical-grade preprocessing & normalizations
        if self.transform:
            processed_tensor = self.transform(raw_signal)
        else:
            # Automatic clinical Z-score normalization
            processed_tensor = torch.tensor(raw_signal, dtype=torch.float32)
            mean, std = processed_tensor.mean(), processed_tensor.std()
            processed_tensor = (processed_tensor - mean) / (std + 1e-6)
            
        if self.labels is not None:
            label = torch.tensor(self.labels[idx], dtype=torch.long)
            return processed_tensor, label
            
        return processed_tensor

# Active pipeline initialization
# Loader leverages pin_memory to feed CUDA cores at speed
# DataLoader: batch_size=${batchVal}, pin_memory=True`;
    }

    if (part === 'model') {
      return `import torch
import torch.nn as nn
import torch.nn.functional as F

class ${normalizedName}(nn.Module):
    """
    Bio-AI Architect: Custom State-of-the-Art Deep Learning construct
    specifically generated for: "${modelName}"
    Designed with biological structural priors & safety weight gates.
    """
    def __init__(self, in_channels=3, num_classes=2):
        super(BiomedicalModel, self).__init__()
        self.model_name = "${modelName}"
        
        # Component 1: Custom Deep Neural Backbone Encoders
        self.conv_stem = nn.Sequential(
            nn.Conv2d(in_channels, 32, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(32),
            nn.SiLU()
        )
        
        # Component 2: Bio-Feature Attention Gating Layer
        self.spatial_attention = nn.Sequential(
            nn.Conv2d(32, 1, kernel_size=7, padding=3, bias=False),
            nn.Sigmoid()
        )
        
        # Component 3: Classification Head with Dropout protection
        self.classifier = nn.Sequential(
            nn.AdaptiveAvgPool2d((1, 1)),
            nn.Flatten(),
            nn.Linear(32, 64),
            nn.SiLU(),
            nn.Dropout(p=0.3),
            nn.Linear(64, num_classes)
        )
        
    def forward(self, x):
        features = self.conv_stem(x)
        attention_map = self.spatial_attention(features)
        gated_features = features * attention_map
        out = self.classifier(gated_features)
        return out, attention_map

# Parameter size initialized with optimal GPU mapping
model = ${normalizedName}(in_channels=3)
print(f"Initialized SOTA Model: {model.model_name}")`;
    }

    if (part === 'training_loop') {
      return `import torch
import torch.optim as optim
import torch.nn as nn

# Instantiation & configuration variables mapping
model = ${normalizedName}().cuda()
optimizer = optim.${optVal}(model.parameters(), lr=${lrVal}, weight_decay=1e-4)

# Dynamic Cosine Annealing Learning Rate Scheduler
scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=20, eta_min=1e-6)
criterion = nn.CrossEntropyLoss(label_smoothing=0.1) # Soft classification bounds

def train_one_epoch(epoch, dataloader):
    model.train()
    total_loss = 0.0
    correct = 0
    total = 0
    
    print(f"--- Launching Training Epoch {epoch} ---")
    for batch_idx, (data, targets) in enumerate(dataloader):
        data, targets = data.cuda(), targets.cuda()
        
        optimizer.zero_grad(set_to_none=True) # Optimized memory gradient release
        
        # Forward Pass
        outputs, _ = model(data)
        loss = criterion(outputs, targets)
        
        # Backward Pass with safety gradient clipping
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()
        
        total_loss += loss.item()
        _, predicted = outputs.max(1)
        total += targets.size(0)
        correct += predicted.eq(targets).sum().item()
        
    scheduler.step()
    epoch_acc = 100. * correct / total
    print(f"Epoch {epoch} finished | Loss: {total_loss/len(dataloader):.4f} | Accuracy: {epoch_acc:.2%}")
    return total_loss/len(dataloader), epoch_acc`;
    }

    if (part === 'inference') {
      return `import torch
import onnx
import numpy as np

def run_onnx_inference_and_quantization(model, sample_input, onnx_save_path):
    """
    Host post-training optimizations and ONNX exports for clinical inference.
    Reducing deployment footprint.
    """
    model.eval()
    print("Preparing Post-Training Quantization to FP16...")
    
    # Export to standard ONNX serialization format
    torch.onnx.export(
        model, 
        sample_input, 
        onnx_save_path, 
        export_params=True, 
        opset_version=14, 
        do_constant_folding=True, 
        input_names=['input_signals'], 
        output_names=['predictions'],
        dynamic_axes={'input_signals': {0: 'batch_size'}, 'predictions': {0: 'batch_size'}}
    )
    print(f"ONNX graph serialized successfully to: {onnx_save_path}")
    
    # Quick benchmark trace
    with torch.no_grad():
        out, att = model(sample_input)
        print(f"Target prediction trace completed. Output tensor shape: {out.shape}")
        
    return onnx_save_path`;
    }
  } else if (framework === 'lightning') {
    return `import pytorch_lightning as pl
import torch
import torch.nn as nn
from torchmetrics import Accuracy

class LitBioArchitect(pl.LightningModule):
    """
    Superb High-Fidelity PyTorch Lightning wrapper for ${modelName}.
    Standardizes cross-device logging, checkpointing, and GPU acceleration.
    """
    def __init__(self, learning_rate=${lrVal}):
        super().__init__()
        self.save_hyperparameters()
        self.model = ${normalizedName}()
        self.criterion = nn.CrossEntropyLoss()
        self.train_acc = Accuracy(task="multiclass", num_classes=2)
        self.val_acc = Accuracy(task="multiclass", num_classes=2)
        
    def forward(self, x):
        return self.model(x)
        
    def training_step(self, batch, batch_idx):
        x, y = batch
        logits, _ = self(x)
        loss = self.criterion(logits, y)
        self.train_acc(logits, y)
        
        self.log("train_loss", loss, on_step=True, on_epoch=True, prog_bar=True)
        self.log("train_acc", self.train_acc, on_epoch=True, prog_bar=True)
        return loss
        
    def validation_step(self, batch, batch_idx):
        x, y = batch
        logits, _ = self(x)
        loss = self.criterion(logits, y)
        self.val_acc(logits, y)
        
        self.log("val_loss", loss, prog_bar=True)
        self.log("val_acc", self.val_acc, prog_bar=True)
        
    def configure_optimizers(self):
        optimizer = torch.optim.${optVal}(self.parameters(), lr=self.hparams.learning_rate)
        scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=10)
        return {"optimizer": optimizer, "lr_scheduler": scheduler}

# Fast training execution script for cluster deployment
# trainer = pl.Trainer(accelerator="gpu", devices=1, max_epochs=20)`;
  } else {
    return `import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

def create_keras_${normalizedName.toLowerCase()}(input_shape=(512, 512, 3), num_classes=2):
    """
    Standard Keras 3 architecture for ${modelName}.
    Compatible with JAX, PyTorch, and TensorFlow execution backends.
    """
    inputs = keras.Input(shape=input_shape, name="biomedical_input")
    
    # Stage 1: Stem blocks
    x = layers.Conv2D(32, kernel_size=3, padding="same", use_bias=False)(inputs)
    x = layers.BatchNormalization()(x)
    x = layers.Activation("silu")(x)
    
    # Stage 2: Attention layers
    attn = layers.Conv2D(1, kernel_size=7, padding="same", activation="sigmoid")(x)
    gated = layers.Multiply()([x, attn])
    
    # Stage 3: Class head
    gap = layers.GlobalAveragePooling2D()(gated)
    dense = layers.Dense(64, activation="silu")(gap)
    dropout = layers.Dropout(0.3)(dense)
    outputs = layers.Dense(num_classes, activation="softmax", name="predictions")(dropout)
    
    model = keras.Model(inputs=inputs, outputs=outputs, name="${normalizedName}")
    
    # Compile with user selected optimizer parameters
    model.compile(
        optimizer=keras.optimizers.Adam(${lrVal}),
        loss=keras.losses.SparseCategoricalCrossentropy(),
        metrics=["accuracy"]
    )
    return model

model = create_keras_${normalizedName.toLowerCase()}()
model.summary()`;
  }
  return '';
};

const MLResultCard: React.FC<MLResultCardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'blueprint' | 'estimator' | 'simulator' | 'code'>('blueprint');

  // Blueprint selection state for Interactive Model Topology
  const [selectedCompIdx, setSelectedCompIdx] = useState<number | null>(0);

  // Estimator States
  const [estDataType, setEstDataType] = useState<'image_3d' | 'image_2d' | 'sequence' | 'graph'>('image_2d');
  const [estDimension, setEstDimension] = useState<number>(512);
  const [estChannels, setEstChannels] = useState<number>(3);
  const [estBatchSize, setEstBatchSize] = useState<number>(16);
  const [estParamCount, setEstParamCount] = useState<number>(45); // Millions
  const [estPrecision, setEstPrecision] = useState<'fp32' | 'fp16' | 'int8'>('fp16');

  // Training Simulator parameters
  const [estLearningRate, setEstLearningRate] = useState<number>(0.0001);
  const [estSimOptimizer, setEstSimOptimizer] = useState<string>('AdamW');
  const [estDropout, setEstDropout] = useState<number>(0.3);
  const [estSimEpochs, setEstSimEpochs] = useState<number>(20);
  const [estLrScheduler, setEstLrScheduler] = useState<boolean>(true);

  // Simulation Running State
  const [simPlaying, setSimPlaying] = useState<boolean>(false);
  const [simEpoch, setSimEpoch] = useState<number>(0);
  const [simLogs, setSimLogs] = useState<Array<{
    epoch: number;
    trainLoss: number;
    valLoss: number;
    accuracy: number;
    valAccuracy: number;
    lr: number;
  }>>([]);

  const simTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Code Frame States
  const [codeFramework, setCodeFramework] = useState<'pytorch' | 'lightning' | 'keras'>('pytorch');
  const [codePart, setCodePart] = useState<'dataset' | 'model' | 'training_loop' | 'inference'>('model');

  const parsedData = useMemo(() => {
    return parseJson(result.content) as MLArchitectureData | null;
  }, [result.content]);

  // Sync simulator parameters if data becomes available
  useEffect(() => {
    if (parsedData) {
      // Intuitively map model size
      if (parsedData.model_name.toLowerCase().includes('transformer') || parsedData.model_name.toLowerCase().includes('swin')) {
        setEstParamCount(87);
        setEstDataType('image_2d');
      } else if (parsedData.model_name.toLowerCase().includes('unet') || parsedData.model_name.toLowerCase().includes('segmentation')) {
        setEstParamCount(34);
        setEstDataType('image_2d');
      } else if (parsedData.model_name.toLowerCase().includes('graph') || parsedData.model_name.toLowerCase().includes('gnn')) {
        setEstParamCount(12);
        setEstDataType('graph');
      } else if (parsedData.model_name.toLowerCase().includes('sequence') || parsedData.model_name.toLowerCase().includes('transformer') || parsedData.model_name.toLowerCase().includes('bert')) {
        setEstParamCount(110);
        setEstDataType('sequence');
      }

      if (parsedData.training_config) {
        const lrStr = parsedData.training_config.learning_rate;
        const bsStr = parsedData.training_config.batch_size;
        const optStr = parsedData.training_config.optimizer;
        
        if (lrStr) {
          const matched = lrStr.match(/[0-9e.-]+/);
          if (matched) setEstLearningRate(parseFloat(matched[0]) || 0.0001);
        }
        if (bsStr) {
          const matched = bsStr.match(/\d+/);
          if (matched) setEstBatchSize(parseInt(matched[0]) || 16);
        }
        if (optStr) {
          if (optStr.toLowerCase().includes('adamw')) setEstSimOptimizer('AdamW');
          else if (optStr.toLowerCase().includes('sgd')) setEstSimOptimizer('SGD');
          else if (optStr.toLowerCase().includes('adam')) setEstSimOptimizer('Adam');
        }
      }
    }
  }, [parsedData]);

  // VRAM & Heuristics calculation formulas
  const vramHeuristics = useMemo(() => {
    const bytesPerFloat = estPrecision === 'fp32' ? 4 : estPrecision === 'fp16' ? 2 : 1;

    let resolutionFactor = 1;
    if (estDataType === 'image_3d') {
      resolutionFactor = estDimension * estDimension * 16; 
    } else if (estDataType === 'image_2d') {
      resolutionFactor = estDimension * estDimension;
    } else if (estDataType === 'sequence') {
      resolutionFactor = estDimension; 
    } else if (estDataType === 'graph') {
      resolutionFactor = estDimension * 4; 
    }

    const rawInputMb = (estBatchSize * resolutionFactor * estChannels * bytesPerFloat) / (1024 * 1024);

    // Model Parameter memory footprint in MB
    const paramMemoryMb = estParamCount * bytesPerFloat;

    // Gradients footprint in MB
    const gradMemoryMb = estParamCount * 4; 

    // Optimizer states (Adam uses double parameters in FP32)
    const optimizerMultiplier = estPrecision === 'int8' ? 0 : 8; 
    const optMemoryMb = estParamCount * optimizerMultiplier;

    // Heuristics for active layers and feature activations
    const layerOverheadFactor = estDataType === 'image_3d' ? 1.8 : estDataType === 'image_2d' ? 2.4 : 0.6;
    const activationsMb = estBatchSize * (resolutionFactor * estChannels * bytesPerFloat * layerOverheadFactor) / (1024 * 1024) * 6;

    // Standard CUDA runtime library overhead
    const cudaOverheadGb = 1.1;

    const totalTrainingGb = ((paramMemoryMb + gradMemoryMb + optMemoryMb + activationsMb) / 1024) + cudaOverheadGb;
    const totalInferenceGb = ((paramMemoryMb + activationsMb / estBatchSize) / 1024) + 0.6;

    let recommendedGpu = "RTX 4060 Ti (16GB)";
    if (totalTrainingGb <= 6) recommendedGpu = "NVIDIA RTX 4060 Mobile / T4 (8GB VRAM)";
    else if (totalTrainingGb <= 12) recommendedGpu = "NVIDIA RTX 4070 Grid / L4 (12GB VRAM)";
    else if (totalTrainingGb <= 16) recommendedGpu = "NVIDIA RTX 4080 / RTX A4000 (16GB VRAM)";
    else if (totalTrainingGb <= 24) recommendedGpu = "NVIDIA RTX 4090 / L40S / RTX 6000 (24GB VRAM)";
    else if (totalTrainingGb <= 40) recommendedGpu = "NVIDIA A100 Tensor Core (40GB VRAM)";
    else recommendedGpu = "NVIDIA H100 / A100 Tensor Core (80GB VRAM)";

    // Estimated training duration per epoch in seconds
    const flopHeuristics = estParamCount * resolutionFactor * estChannels * estBatchSize * 12;
    const gpuFlopsPerf = totalTrainingGb > 24 ? 300e12 : totalTrainingGb > 16 ? 150e12 : 80e12; 
    const secondsPerEpoch = Math.max(1, (flopHeuristics / gpuFlopsPerf) * 4.5);

    return {
      rawInputMb: rawInputMb.toFixed(3),
      paramMemoryMb: paramMemoryMb.toFixed(1),
      gradMemoryMb: gradMemoryMb.toFixed(1),
      optMemoryMb: optMemoryMb.toFixed(1),
      activationsMb: activationsMb.toFixed(1),
      totalTrainingGb: totalTrainingGb.toFixed(2),
      totalInferenceGb: totalInferenceGb.toFixed(2),
      recommendedGpu,
      secondsPerEpoch: secondsPerEpoch.toFixed(1)
    };
  }, [estDataType, estDimension, estChannels, estBatchSize, estParamCount, estPrecision]);

  // Clean play/pause interval timer on dismantle
  useEffect(() => {
    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, []);

  // Simulator Engine logic
  const handleToggleSimulation = () => {
    if (simPlaying) {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
      setSimPlaying(false);
    } else {
      setSimPlaying(true);
      
      // If completed previously, start fresh on click
      let currentEpoch = simEpoch >= estSimEpochs ? 0 : simEpoch;
      let logs = currentEpoch === 0 ? [] : [...simLogs];
      
      if (currentEpoch === 0) {
        setSimEpoch(0);
        setSimLogs([]);
      }

      simTimerRef.current = setInterval(() => {
        currentEpoch++;
        
        // ML Heuristic calculation coefficients based on sliders
        // Check for catastrophic overfitting or learning rate issues
        let learningRateSensitivity = Math.log10(estLearningRate); 
        let noiseLevel = estSimOptimizer === 'SGD' ? 0.08 : 0.03;
        
        // If rate is too high, simulation diverges to NaN mimicking real life
        let diverged = estLearningRate > 0.005; 
        
        let loss = 0;
        let valLoss = 0;
        let accuracy = 0;
        let valAccuracy = 0;

        if (diverged) {
          loss = NaN;
          valLoss = NaN;
          accuracy = 0.5 / (1.0 + currentEpoch*0.1);
          valAccuracy = 0.5;
        } else {
          // Normal learning process
          const rateMultiplier = estSimOptimizer === 'AdamW' ? 1.0 : estSimOptimizer === 'Adam' ? 0.85 : 0.6;
          // Cosine annealing learning rate scheduler decay effect
          const currentLR = estLrScheduler 
            ? estLearningRate * (0.5 * (1 + Math.cos(Math.PI * currentEpoch / estSimEpochs)))
            : estLearningRate;

          // base learning factor
          const speed = rateMultiplier * (1.1 - estDropout * 0.3) * (1.2 + Math.log10(currentLR) / 4);
          
          loss = Math.max(0.04, 1.0 / (1.0 + currentEpoch * 0.45 * speed) + (Math.random() - 0.5) * noiseLevel);
          accuracy = Math.min(0.995, 0.45 + (0.52 * (1.0 - loss)) + (Math.random() - 0.5) * 0.015);
          
          // Generate validation curves with standard Generalization gap
          // High dropout reduces generalization gap, low dropout triggers late overfit
          const overfitFactor = (estDropout < 0.1 && currentEpoch > estSimEpochs * 0.65) ? (currentEpoch - estSimEpochs * 0.65) * 0.03 : 0;
          
          valLoss = loss * (1.08 + overfitFactor) + (Math.random() - 0.5) * 0.02;
          valAccuracy = Math.min(0.985, accuracy * (0.97 - overfitFactor) + (Math.random() - 0.5) * 0.012);
        }

        const newLog = {
          epoch: currentEpoch,
          trainLoss: isNaN(loss) ? NaN : parseFloat(loss.toFixed(4)),
          valLoss: isNaN(valLoss) ? NaN : parseFloat(valLoss.toFixed(4)),
          accuracy: parseFloat(accuracy.toFixed(4)),
          valAccuracy: parseFloat(valAccuracy.toFixed(4)),
          lr: estLrScheduler ? estLearningRate * (0.5 * (1 + Math.cos(Math.PI * currentEpoch / estSimEpochs))) : estLearningRate
        };

        logs.push(newLog);
        setSimLogs([...logs]);
        setSimEpoch(currentEpoch);

        if (currentEpoch >= estSimEpochs || diverged) {
          if (simTimerRef.current) clearInterval(simTimerRef.current);
          setSimPlaying(false);
        }
      }, 220); // 220ms per epoch for smooth visuals
    }
  };

  const handleResetSimulation = () => {
    if (simTimerRef.current) clearInterval(simTimerRef.current);
    setSimPlaying(false);
    setSimEpoch(0);
    setSimLogs([]);
  };

  // SVG Line Generation algorithm
  const generateSvgPath = (key: 'trainLoss' | 'valLoss' | 'accuracy' | 'valAccuracy', width: number, height: number) => {
    if (simLogs.length < 2) return '';
    
    // Find min and max boundaries to normalize coordinates
    let minVal = 0;
    let maxVal = 1.0;

    if (key === 'trainLoss' || key === 'valLoss') {
      const allLosses = simLogs.flatMap(d => [d.trainLoss, d.valLoss]).filter(v => !isNaN(v));
      if (allLosses.length > 0) {
        maxVal = Math.max(1.1, ...allLosses) * 1.05;
      }
    } else {
      const allAccs = simLogs.flatMap(d => [d.accuracy, d.valAccuracy]);
      minVal = Math.min(0.4, ...allAccs) * 0.95;
      maxVal = Math.max(1.0, ...allAccs);
    }

    const valueRange = maxVal - minVal;
    
    return simLogs.reduce((path, point, index) => {
      const val = point[key];
      if (isNaN(val)) return path;
      
      const x = (index / (estSimEpochs - 1)) * width;
      const y = height - ((val - minVal) / (valueRange || 1)) * height;
      
      return path + (index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
    }, '');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const data = parsedData;
    if (!data) return;
    const blob = new Blob([data.implementation_code], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.model_name.replace(/\s+/g, '_').toLowerCase()}.py`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // PDF Export using jsPDF with pristine layout matching other system files
  const handleExportPDF = () => {
    const data = parsedData;
    if (!data) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    let currentPage = 1;
    const addHeaderAndFooter = (pdf: jsPDF) => {
      // Dark Slate Header Block
      pdf.setFillColor(15, 23, 42); 
      pdf.rect(0, 0, 210, 32, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('Helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('BioSearch ARCHITECT', 15, 14);
      
      pdf.setFont('Helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(244, 63, 184); // fuchsia tint
      pdf.text('DEEP REINFORCEMENT LEARNING & BIOMEDICAL GENERATIVE MODEL SPECIFICATION', 15, 21);
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.text(`Page ${currentPage}`, 182, 16);

      // Deep fuchsia accent border
      pdf.setFillColor(192, 38, 211); 
      pdf.rect(0, 31, 210, 1.2, 'F');
    };

    addHeaderAndFooter(doc);

    let y = 45;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = 180;

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - 20) {
        doc.addPage();
        currentPage++;
        addHeaderAndFooter(doc);
        y = 45;
      }
    };

    // 1. Executive Summary Panel
    doc.setTextColor(100, 116, 139);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('I. EXECUTIVE ARCHITECTURE BLUEPRINT', margin, y);
    y += 5;

    doc.setFillColor(250, 245, 255); 
    doc.setDrawColor(245, 212, 253); 
    doc.rect(margin, y, contentWidth, 32, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(data.model_name, margin + 5, y + 7);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const splitReasoning = doc.splitTextToSize(data.reasoning, contentWidth - 10);
    doc.text(splitReasoning, margin + 5, y + 14);
    y += 38;

    // 2. Hardware and Training Config Summary
    checkPageBreak(35);
    doc.setTextColor(100, 116, 139);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('II. COMPUTATIONAL RESOURCE FOOTPRINT', margin, y);
    y += 5;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 26, 'FD');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('Estimated VRAM Usage (Training):', margin + 5, y + 6);
    doc.text('Estimated VRAM Usage (Inference):', margin + 5, y + 12);
    doc.text('Minimum Hardware Requirements:', margin + 5, y + 18);

    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`${vramHeuristics.totalTrainingGb} GB`, margin + 65, y + 6);
    doc.text(`${vramHeuristics.totalInferenceGb} GB`, margin + 65, y + 12);
    doc.text(data.hardware_requirements || vramHeuristics.recommendedGpu, margin + 65, y + 18);
    y += 32;

    // 3. Components Table
    checkPageBreak(50);
    doc.setTextColor(100, 116, 139);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('III. DETAILED LAYERS & NETWORK COMPONENTS', margin, y);
    y += 6;

    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('Component Block', margin + 3, y + 5.5);
    doc.text('Type Layer', margin + 45, y + 5.5);
    doc.text('Functional Role & Parameters', margin + 90, y + 5.5);
    y += 8;

    data.architecture_components.forEach((comp, idx) => {
      const splitRole = doc.splitTextToSize(`${comp.description} Details: ${comp.details}`, contentWidth - 95);
      const rowHeight = Math.max(10, splitRole.length * 4 + 4);
      
      checkPageBreak(rowHeight);
      
      // Zebra shading
      if (idx % 2 === 0) {
        doc.setFillColor(252, 252, 252);
        doc.rect(margin, y, contentWidth, rowHeight, 'F');
      }
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(comp.name, margin + 3, y + 5);

      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(comp.type, margin + 45, y + 5);
      doc.text(splitRole, margin + 90, y + 5);
      
      y += rowHeight;
    });
    y += 6;

    // 4. Data Preprocessing & Loss Strategy
    checkPageBreak(40);
    doc.setTextColor(100, 116, 139);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('IV. DATA PREPROCESSING & LOSS PIPELINE', margin, y);
    y += 5;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 24, 'FD');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('Loss Function:', margin + 5, y + 6);
    doc.text('Evaluation Metrics:', margin + 5, y + 12);
    doc.text('Data Steps:', margin + 5, y + 18);

    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(data.pipeline_strategy.loss_function, margin + 40, y + 6);
    doc.text(data.pipeline_strategy.metrics.join(', '), margin + 40, y + 12);
    doc.text(data.pipeline_strategy.preprocessing.slice(0, 2).join(' | '), margin + 40, y + 18);
    y += 30;

    // 5. Code Scaffold section (Full page or remaining space)
    checkPageBreak(80);
    doc.setTextColor(100, 116, 139);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('V. PYTORCH HIGH-FIDELITY IMPLEMENTATION BACKBONE', margin, y);
    y += 5;

    doc.setFillColor(15, 23, 42);
    doc.rect(margin, y, contentWidth, 100, 'F');

    doc.setFont('Courier', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(236, 72, 153); // pink keyword
    doc.text('import torch\nimport torch.nn as nn', margin + 5, y + 8);

    doc.setTextColor(244, 63, 94);
    doc.text(`class ${data.model_name.replace(/[^a-zA-Z]/g, '')}(nn.Module):`, margin + 5, y + 16);
    
    doc.setTextColor(200, 200, 200);
    const codeSample = data.implementation_code.split('\n').slice(0, 28).join('\n');
    doc.text(codeSample, margin + 5, y + 22);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(150, 150, 150);
    doc.text('... Complete functional script provided on active workspace builder module ...', margin + 15, y + 92);

    // Save final document
    doc.save(`bioai_architect_${data.model_name.replace(/\s+/g, '_').toLowerCase()}.pdf`);
  };

  const parseJson = (str: string) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      const jsonMatch = str.match(/```json\s*([\s\S]*?)\s*```/) || str.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          return JSON.parse(jsonMatch[1]);
        } catch (innerE) {
          return null;
        }
      }
      return null;
    }
  };

  const activeComponentCode = useMemo(() => {
    if (!parsedData || selectedCompIdx === null) return '';
    const comp = parsedData.architecture_components[selectedCompIdx];
    if (!comp) return '';

    return `import torch
import torch.nn as nn

class BioLayerBlock(nn.Module):
    """
    Subunit segment for: ${comp.name}
    Layer Type: ${comp.type}
    Functional Role: ${comp.description}
    """
    def __init__(self, channels=128):
        super().__init__()
        # Dynamic extraction of SOTA setup parameters: ${comp.details}
        self.block_name = "${comp.name}"
        self.conv1 = nn.Conv2d(channels, channels, kernel_size=3, padding=1, bias=False)
        self.bn = nn.BatchNorm2d(channels)
        self.activation = nn.SiLU()
        
    def forward(self, x):
        residual = x
        out = self.conv1(x)
        out = self.bn(out)
        out = self.activation(out)
        return out + residual`;
  }, [parsedData, selectedCompIdx]);

  const renderContent = () => {
    const data = parsedData;

    if (!data) {
      return renderLegacyContent(result.content);
    }

    return (
      <div className="space-y-6">
        
        {/* Dynamic Nav Tabs */}
        <div className="flex border-b border-slate-200 bg-white/50 p-1.5 rounded-2xl gap-1 overflow-x-auto select-none shadow-inner border border-slate-100">
          <button
            onClick={() => setActiveTab('blueprint')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'blueprint'
                ? 'bg-fuchsia-600 border-fuchsia-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100/60 hover:text-slate-900'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Architecture Blueprint</span>
          </button>
          
          <button
            onClick={() => setActiveTab('estimator')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'estimator'
                ? 'bg-fuchsia-600 border-fuchsia-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100/60 hover:text-slate-900'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Compute & VRAM Estimator</span>
            <span className="text-[9px] bg-fuchsia-100 text-fuchsia-700 font-extrabold px-1.5 py-0.5 rounded-full ml-1">Calc</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-fuchsia-600 border-fuchsia-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100/60 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Training Simulator</span>
            {simEpoch > 0 && (
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded-full ml-1">
                Epoch {simEpoch}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'code'
                ? 'bg-fuchsia-600 border-fuchsia-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100/60 hover:text-slate-900'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Framework Code Exporter</span>
          </button>
        </div>

        {/* TAB 1: ARCHITECTURE BLUEPRINT */}
        {activeTab === 'blueprint' && (
          <div className="space-y-6">
            
            {/* Model Title & Reasoning */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden text-left">
              <div className="absolute top-0 left-0 w-1 h-full bg-fuchsia-600" />
              <div className="flex justify-between items-start gap-4 mb-3">
                <h2 id={`model-title-${data.model_name.replace(/\s+/g, '-').toLowerCase()}`} className="text-xl font-bold text-slate-900 flex items-center gap-2 tracking-tight">
                  <BrainCircuit className="w-5.5 h-5.5 text-fuchsia-600" />
                  {data.model_name}
                </h2>
                <span className="text-[9px] px-2.5 py-1 bg-fuchsia-50 text-fuchsia-700 font-mono font-bold rounded-lg border border-fuchsia-200">
                  SOTA DESIGNED
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed text-sm">
                {data.reasoning}
              </p>
            </div>

            {/* Mermaid Topology Diagram - Render dynamically */}
            {data.mermaid_diagram && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-left">
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold block mb-3 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-fuchsia-500" /> Layer Flow Connection Topology
                </span>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl overflow-x-auto justify-center flex">
                  <MermaidDiagram chart={data.mermaid_diagram} />
                </div>
              </div>
            )}

            {/* Interactive Model Topology & Grid Components */}
            <div>
              <span className="text-[10.5px] font-mono tracking-widest text-slate-400 font-bold uppercase block mb-3.5 px-1 flex items-center gap-1.5">
                <GitBranch className="w-4.5 h-4.5 text-fuchsia-500" />
                Selected Network Neural Blocks (Interactive Explorer)
              </span>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Side Component List (Clickable) */}
                <div className="lg:col-span-5 space-y-2 text-left">
                  {data.architecture_components.map((comp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedCompIdx(idx)}
                      className={`w-full text-left p-4.5 rounded-xl border transition-all flex justify-between items-center group cursor-pointer ${
                        selectedCompIdx === idx
                          ? 'bg-fuchsia-50/50 border-fuchsia-300 text-fuchsia-950 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-350 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <p className="font-bold text-xs">{comp.name}</p>
                        <p className={`text-[10px] font-medium font-mono ${selectedCompIdx === idx ? 'text-fuchsia-600' : 'text-slate-400'}`}>
                          {comp.type}
                        </p>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${selectedCompIdx === idx ? 'text-fuchsia-500' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>

                {/* Live Block Compiler Explanation Panel */}
                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl text-white p-5 md:p-6 text-left flex flex-col justify-between">
                  {selectedCompIdx !== null && data.architecture_components[selectedCompIdx] ? (
                    <div className="space-y-5">
                      <div>
                        <div className="flex justify-between items-start gap-4 border-b border-white/10 pb-3">
                          <div>
                            <span className="text-[9px] font-mono font-bold text-fuchsia-400 uppercase tracking-widest block">INTERACTIVE LAYER INSPECTOR</span>
                            <h4 className="font-bold text-sm md:text-base mt-1 text-slate-50">{data.architecture_components[selectedCompIdx].name}</h4>
                          </div>
                          <span className="text-[9.5px] font-bold font-mono bg-white/10 text-fuchsia-100 border border-white/10 px-2 py-0.5 rounded-lg uppercase">
                            {data.architecture_components[selectedCompIdx].type}
                          </span>
                        </div>

                        <div className="pt-4 space-y-3.5">
                          <div>
                            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block font-mono">Functional Role</span>
                            <p className="text-xs text-slate-300 leading-relaxed mt-1">
                              {data.architecture_components[selectedCompIdx].description}
                            </p>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block font-mono">Hyperparameter Tuning Matrix</span>
                            <p className="text-xs font-mono text-emerald-400 font-semibold bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 mt-1">
                              {data.architecture_components[selectedCompIdx].details}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* PyTorch Subunit Code block */}
                      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                        <div className="bg-slate-850 px-3 py-1.5 flex justify-between items-center border-b border-slate-800">
                          <span className="text-[9px] font-mono font-bold text-slate-300 flex items-center gap-1">
                            <Terminal className="w-3.5 h-3.5 text-fuchsia-400" />
                            PyTorch Submodule Layer Scaffold
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(activeComponentCode);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 1500);
                            }}
                            className="text-[9px] font-extrabold text-slate-400 hover:text-white transition-colors"
                          >
                            {copied ? 'Copied!' : 'Copy Code'}
                          </button>
                        </div>
                        <pre className="p-3 text-[10px] font-mono leading-relaxed overflow-x-auto text-slate-300">
                          {activeComponentCode}
                        </pre>
                      </div>

                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center space-y-2">
                      <HelpCircle className="w-8 h-8 text-slate-500 animate-pulse" />
                      <p className="text-xs font-bold">Select a component to inspect hyperparameters & active code framework</p>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* General Pipe Strategy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Data Preprocessing */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 text-left">
                <span className="text-[10.5px] font-mono tracking-widest text-slate-400 font-bold uppercase block mb-3 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-fuchsia-500" /> Data Preprocessing Steps
                </span>
                <ul className="space-y-2.5">
                  {data.pipeline_strategy.preprocessing.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="leading-normal">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Training Specs Summary */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 text-left space-y-4">
                <span className="text-[10.5px] font-mono tracking-widest text-slate-400 font-bold uppercase block flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-fuchsia-500" /> Loss & Optimization Strategy
                </span>

                <div className="space-y-3.5">
                  <div>
                    <span className="text-[9.5px] font-bold text-slate-405 uppercase block">Clinical/Biological Target Loss function</span>
                    <p className="bg-fuchsia-50 text-fuchsia-800 text-xs font-bold px-3 py-2 rounded-xl border border-fuchsia-100 mt-1 leading-normal">
                      {data.pipeline_strategy.loss_function}
                    </p>
                  </div>

                  <div>
                    <span className="text-[9.5px] font-bold text-slate-405 uppercase block">Assigned Validation Metrics</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {data.pipeline_strategy.metrics.map((m, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600 text-[10.5px] font-bold rounded-lg flex items-center gap-1 shadow-inner">
                          <BarChart className="w-3.5 h-3.5 text-slate-400" /> {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Explainable AI & Production Readiness Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              <div className="bg-white p-5 rounded-2xl border border-slate-200 text-left space-y-2">
                <span className="text-[10.5px] font-mono tracking-widest text-slate-400 font-bold uppercase block flex items-center gap-1.5">
                  <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" /> Trustworthy AI & Interpretability
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {data.uncertainty_quantification || "Includes Bayesian MC Dropout and layer activation mapping to estimate visual uncertainty."}
                </p>
                {data.pipeline_strategy.interpretability && (
                  <div className="mt-2.5 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[8.5px] font-bold font-mono tracking-wider text-slate-450 block uppercase">XAI Verification Method</span>
                    <p className="text-[11.5px] text-fuchsia-950 font-bold leading-normal mt-0.5">{data.pipeline_strategy.interpretability}</p>
                  </div>
                )}
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 text-left space-y-2">
                <span className="text-[10.5px] font-mono tracking-widest text-slate-400 font-bold uppercase block flex items-center gap-1.5">
                  <Zap className="w-4.5 h-4.5 text-amber-500" /> Production Readiness
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {data.deployment_hints || "Configured for direct half-precision (FP16) serialization to ONNX and core TensorRT graphs."}
                </p>
                {data.hardware_requirements && (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[8.5px] font-bold font-mono tracking-wider text-slate-450 block uppercase">Hardware Recommendations</span>
                    <p className="text-[11.5px] text-slate-800 font-bold leading-normal mt-0.5">{data.hardware_requirements}</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: COMPUTE & VRAM ESTIMATOR */}
        {activeTab === 'estimator' && (
          <div className="space-y-6">
            
            {/* Introductory Explanation */}
            <div className="bg-gradient-to-r from-fuchsia-50 to-purple-50/50 p-5 rounded-2xl border border-fuchsia-105/70 text-left flex items-start gap-3">
              <div className="p-2 bg-white border border-fuchsia-100 rounded-xl text-fuchsia-600 hidden sm:block">
                <Sliders className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-sm">VRAM & Memory Allocation Calculator</h4>
                <p className="text-xs text-slate-505 leading-relaxed leading-snug">
                  Accurately size model weight footprints, gradient memory pools, optimizer tracking charts, and layer spatial registrations depending on data type and precision. Fits your pipeline safely on GPU hardware.
                </p>
              </div>
            </div>

            {/* Inputs & Controls Panel */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-left">
              
              {/* Step 1 Parameters Sidebar */}
              <div className="md:col-span-2 space-y-5 bg-white p-5 rounded-2xl border border-slate-205">
                <span className="text-[10px] font-bold font-mono text-slate-450 uppercase tracking-widest block pt-1 border-b border-slate-100 pb-1.5">
                  Step 1: Input Dimensions
                </span>

                {/* Data format selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-650 block">Target Data Medium Format</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'image_2d', label: '2D Histology/Slice' },
                      { id: 'image_3d', label: '3D Image Volume' },
                      { id: 'sequence', label: 'Sequence/AA' },
                      { id: 'graph', label: 'Molecular Graph' }
                    ].map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => {
                          setEstDataType(type.id as any);
                          if (type.id === 'image_3d') {
                            setEstDimension(128);
                          } else if (type.id === 'image_2d') {
                            setEstDimension(512);
                          } else {
                            setEstDimension(1024);
                          }
                        }}
                        className={`p-2 rounded-xl text-center border text-xs font-semibold select-none transition-all cursor-pointer ${
                          estDataType === type.id
                            ? 'bg-fuchsia-600 border-fuchsia-500 text-white font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Spatial Grid dimension slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600">
                      {estDataType === 'sequence' ? 'Sequence token length' : 'Spatial Grid resolution'}
                    </span>
                    <span className="text-fuchsia-600 font-mono font-black">{estDimension} px/tokens</span>
                  </div>
                  <input
                    type="range"
                    min="32"
                    max={estDataType === 'image_3d' ? '256' : '1024'}
                    step="32"
                    value={estDimension}
                    onChange={(e) => setEstDimension(parseInt(e.target.value))}
                    className="w-full accent-fuchsia-650 cursor-pointer"
                  />
                </div>

                {/* Channels slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-650">Input Channels / Embedding Size</span>
                    <span className="text-fuchsia-600 font-mono font-black">{estChannels}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max={estDataType === 'sequence' ? '512' : '12'}
                    value={estChannels}
                    onChange={(e) => setEstChannels(parseInt(e.target.value))}
                    className="w-full accent-fuchsia-650 cursor-pointer"
                  />
                </div>

                <span className="text-[10px] font-bold font-mono text-slate-450 uppercase tracking-widest block pt-3 border-b border-slate-100 pb-1.5">
                  Step 2: Model Specifications
                </span>

                {/* Parameter scale slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-650">Estimated Param Count</span>
                    <span className="text-fuchsia-600 font-mono font-black">{estParamCount}M params</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="450"
                    step="5"
                    value={estParamCount}
                    onChange={(e) => setEstParamCount(parseInt(e.target.value))}
                    className="w-full accent-fuchsia-650 cursor-pointer"
                  />
                </div>

                {/* Batch Size Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-650 block">Training Batch Size (Mini-Batch)</label>
                  <select
                    value={estBatchSize}
                    onChange={(e) => setEstBatchSize(parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-205 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer"
                  >
                    {[2, 4, 8, 16, 32, 64, 128].map(bs => (
                      <option key={bs} value={bs}>Batch size of {bs}</option>
                    ))}
                  </select>
                </div>

                {/* Float Precision Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-650 block">Computation Float Precision</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'fp32', label: 'FP32', desc: 'Single float' },
                      { id: 'fp16', label: 'FP16', desc: 'Half-precision/AMP' },
                      { id: 'int8', label: 'INT8', desc: 'Quantized layer' }
                    ].map(pr => (
                      <button
                        key={pr.id}
                        type="button"
                        onClick={() => setEstPrecision(pr.id as any)}
                        className={`p-1.5 rounded-xl text-center border transition-all cursor-pointer ${
                          estPrecision === pr.id
                            ? 'bg-fuchsia-600 border-fuchsia-500 text-white shadow-xs font-black'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                        }`}
                      >
                        <p className="text-xs font-extrabold">{pr.label}</p>
                        <p className={`text-[8px] font-medium leading-none block mt-0.5 ${estPrecision === pr.id ? 'text-fuchsia-100' : 'text-slate-400'}`}>{pr.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Step 2 Outputs Dashboard Display */}
              <div className="md:col-span-3 bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl text-white space-y-6 flex flex-col justify-between">
                
                {/* Title */}
                <div className="pb-3 border-b border-white/10">
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-fuchsia-400 font-mono block">LIVE MASS SCALE ESTIMATOR</span>
                  <h4 className="font-bold text-base md:text-lg tracking-tight mt-1">GPU VRAM Allocation Ledger</h4>
                </div>

                {/* Progress bar ledger */}
                <div className="space-y-4">
                  <span className="text-[10px] uppercase font-bold font-mono text-slate-400 tracking-wider block">
                    VRAM Footprint Subdivisions:
                  </span>

                  <div className="space-y-3">
                    {/* Weight Pool Component */}
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-1.5 text-slate-350 font-bold">
                        <span className="w-2.5 h-2.5 bg-fuchsia-400 rounded-full" />
                        Model Weights Pool ({estPrecision.toUpperCase()})
                      </span>
                      <span className="font-mono text-white font-extrabold">{vramHeuristics.paramMemoryMb} MB</span>
                    </div>

                    {/* Gradient Pool Component */}
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-1.5 text-slate-350 font-bold">
                        <span className="w-2.5 h-2.5 bg-rose-400 rounded-full" />
                        Gradient Backward Graph (FP32)
                      </span>
                      <span className="font-mono text-white font-extrabold">{vramHeuristics.gradMemoryMb} MB</span>
                    </div>

                    {/* Optimizer States component */}
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-1.5 text-slate-350 font-bold">
                        <span className="w-2.5 h-2.5 bg-sky-400 rounded-full" />
                        Optimizer Momentum States (AdamW)
                      </span>
                      <span className="font-mono text-white font-extrabold">{vramHeuristics.optMemoryMb} MB</span>
                    </div>

                    {/* Activations layer component */}
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-1.5 text-slate-350 font-bold">
                        <span className="w-2.5 h-2.5 bg-amber-400 rounded-full" />
                        Layer Spatial Activations (Tensors)
                      </span>
                      <span className="font-mono text-white font-extrabold">{vramHeuristics.activationsMb} MB</span>
                    </div>
                  </div>

                  {/* Horizontal Stack Progress Bar */}
                  <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden flex shadow-inner">
                    <div className="bg-fuchsia-400 h-full" style={{ width: `${Math.min(50, (parseFloat(vramHeuristics.paramMemoryMb)/1024)/parseFloat(vramHeuristics.totalTrainingGb)*100)}%` }} />
                    <div className="bg-rose-400 h-full" style={{ width: `${Math.min(50, (parseFloat(vramHeuristics.gradMemoryMb)/1024)/parseFloat(vramHeuristics.totalTrainingGb)*100)}%` }} />
                    <div className="bg-sky-400 h-full" style={{ width: `${Math.min(50, (parseFloat(vramHeuristics.optMemoryMb)/1024)/parseFloat(vramHeuristics.totalTrainingGb)*100)}%` }} />
                    <div className="bg-amber-400 h-full" style={{ width: `${Math.min(50, (parseFloat(vramHeuristics.activationsMb)/1024)/parseFloat(vramHeuristics.totalTrainingGb)*100)}%` }} />
                  </div>
                </div>

                {/* Hardware Recommended final banner */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                      <span className="text-[8.5px] font-bold font-mono text-fuchsia-400 uppercase tracking-widest block">Total training VRAM</span>
                      <p className="text-base font-mono font-black text-rose-350">{vramHeuristics.totalTrainingGb} GB</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                      <span className="text-[8.5px] font-bold font-mono text-fuchsia-400 uppercase tracking-widest block">Estimated Time per Epoch</span>
                      <p className="text-base font-mono font-black text-amber-350">~ {vramHeuristics.secondsPerEpoch}s / epoch</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-fuchsia-950/40 border border-fuchsia-800/20 text-fuchsia-200 rounded-xl flex items-center gap-3">
                    <Cpu className="w-5.5 h-5.5 text-fuchsia-400 shrink-0" />
                    <div>
                      <span className="text-[8.5px] font-bold font-mono text-fuchsia-300 block uppercase">Recommended minimum gpu instance</span>
                      <p className="text-xs font-bold font-sans text-white">{vramHeuristics.recommendedGpu}</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 3: TRAINING SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            
            {/* Simulator Controls & Graph Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 text-left">
              
              {/* Sidebar Tuning Sliders */}
              <div className="lg:col-span-2 space-y-5 bg-white p-5 rounded-2xl border border-slate-205">
                <span className="text-[10px] font-bold font-mono text-slate-450 uppercase tracking-widest block pt-1 border-b border-slate-100 pb-1.5">
                  Tuning Hyperparameters
                </span>

                {/* Optimizers dropdown */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-650 block">Optimizer Engine</label>
                  <select
                    value={estSimOptimizer}
                    onChange={(e) => setEstSimOptimizer(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="AdamW">AdamW (Optimized weight decay standard)</option>
                    <option value="Adam">Adam (Classic Adaptive Momentum)</option>
                    <option value="SGD">Stochastic Gradient Descent (With 0.9 Momentum)</option>
                  </select>
                </div>

                {/* Learning Rate Multipliers */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-650 block">Target Base Learning Rate (LR)</label>
                  <select
                    value={estLearningRate}
                    onChange={(e) => setEstLearningRate(parseFloat(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-205 rounded-xl px-3 py-2 text-xs font-bold text-slate-705 outline-none cursor-pointer font-mono"
                  >
                    <option value="0.01">1e-2 (Aggressive - High divergence risk)</option>
                    <option value="0.001">1e-3 (Flexible default for simple grids)</option>
                    <option value="0.0001">1e-4 (Standard swin/transformer default)</option>
                    <option value="0.00001">1e-5 (Cautious fine-tuning)</option>
                  </select>
                </div>

                {/* Dropout intensity slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-650">Dropout Regulation Gate</span>
                    <span className="text-fuchsia-600 font-mono font-black">{estDropout} rate</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="0.7"
                    step="0.05"
                    value={estDropout}
                    onChange={(e) => setEstDropout(parseFloat(e.target.value))}
                    className="w-full accent-fuchsia-650 cursor-pointer"
                  />
                </div>

                {/* Simulated Epochs range */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-650">Simulation Frame Count (Epochs)</span>
                    <span className="text-fuchsia-600 font-mono font-black">{estSimEpochs} Epochs</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    step="5"
                    value={estSimEpochs}
                    onChange={(e) => {
                      setEstSimEpochs(parseInt(e.target.value));
                      if (simEpoch > parseInt(e.target.value)) {
                        handleResetSimulation();
                      }
                    }}
                    className="w-full accent-fuchsia-650 cursor-pointer"
                  />
                </div>

                {/* Decoupled Cosine Annealing toggle block */}
                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={estLrScheduler}
                      onChange={(e) => setEstLrScheduler(e.target.checked)}
                      className="w-4.5 h-4.5 rounded text-fuchsia-650 focus:ring-fuchsia-400 border-slate-350 cursor-pointer"
                    />
                    <div className="text-[11.5px] text-slate-650 font-bold leading-normal">
                      Enable CosineAnnealingLR weight decay schedule
                    </div>
                  </label>
                </div>

                {/* Action CTA Buttons */}
                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={handleToggleSimulation}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-extrabold text-xs select-none shadow-sm transition-all cursor-pointer ${
                      simPlaying 
                        ? 'bg-amber-600 text-white hover:bg-amber-700' 
                        : 'bg-fuchsia-600 text-white hover:bg-fuchsia-700'
                    }`}
                  >
                    {simPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{simPlaying ? 'Pause Simulation' : 'Launch Simulation'}</span>
                  </button>

                  <button
                    onClick={handleResetSimulation}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:text-slate-900 text-slate-600 rounded-xl font-bold text-xs select-none cursor-pointer"
                    title="Reset Simulator"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

              </div>

              {/* Dynamic SVG Plotting Canvas & Terminal logs */}
              <div className="lg:col-span-3 bg-slate-900 border border-slate-800 p-5 rounded-3xl text-white flex flex-col justify-between space-y-6">
                
                {/* Visual Chart Header */}
                <div className="flex justify-between items-center pb-2.5 border-b border-white/10">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-fuchsia-400 font-mono block">Biomedical Convergence Matrix</span>
                    <h4 className="font-bold text-sm md:text-base text-slate-100 mt-0.5">Real-time Training metrics</h4>
                  </div>
                  {simEpoch > 0 && (
                    <span className="text-xs font-mono bg-white/15 border border-white/15 px-2.5 py-1.5 rounded-xl uppercase flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${simPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                      Epoch {simEpoch} / {estSimEpochs}
                    </span>
                  )}
                </div>

                {/* Double SVG Canvas Plot Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Loss Chart */}
                  <div className="bg-slate-950 p-3.5 border border-slate-805 rounded-2xl flex flex-col justify-between space-y-3 relative overflow-hidden">
                    <div className="flex justify-between items-center">
                      <span className="text-[9.5px] uppercase font-bold font-mono text-slate-450 tracking-wider">Evaluation Loss Rate</span>
                      <div className="flex gap-2 text-[9.5px] tracking-wide font-bold">
                        <span className="flex items-center gap-1 text-[#ec4899]"><span className="w-1.5 h-1.5 bg-[#ec4899] rounded-full" />Train</span>
                        <span className="flex items-center gap-1 text-[#fb7185]"><span className="w-1.5 h-1.5 bg-[#fb7185] rounded-full" />Val</span>
                      </div>
                    </div>

                    <div className="relative w-full h-[140px] border-b border-l border-white/10 mt-1">
                      {simLogs.length >= 2 ? (
                        <svg className="w-full h-full">
                          {/* Training Loss Line */}
                          <path
                            d={generateSvgPath('trainLoss', 180, 140)}
                            fill="none"
                            stroke="#ec4899"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                          {/* Validation Loss Line */}
                          <path
                            d={generateSvgPath('valLoss', 180, 140)}
                            fill="none"
                            stroke="#fb7185"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeDasharray="4,4"
                          />
                        </svg>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-[10.5px]">
                          Click 'Launch' to draw dynamic loss signals
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Accuracy Chart */}
                  <div className="bg-slate-950 p-3.5 border border-slate-805 rounded-2xl flex flex-col justify-between space-y-3 relative overflow-hidden">
                    <div className="flex justify-between items-center">
                      <span className="text-[9.5px] uppercase font-bold font-mono text-slate-450 tracking-wider">AUC / Accuracy convergence</span>
                      <div className="flex gap-2 text-[9.5px] tracking-wide font-bold">
                        <span className="flex items-center gap-1 text-[#38bdf8]"><span className="w-1.5 h-1.5 bg-[#38bdf8] rounded-full" />Train</span>
                        <span className="flex items-center gap-1 text-[#2dd4bf]"><span className="w-1.5 h-1.5 bg-[#2dd4bf] rounded-full" />Val</span>
                      </div>
                    </div>

                    <div className="relative w-full h-[140px] border-b border-l border-white/10 mt-1">
                      {simLogs.length >= 2 ? (
                        <svg className="w-full h-full">
                          {/* Training Accuracy Line */}
                          <path
                            d={generateSvgPath('accuracy', 180, 140)}
                            fill="none"
                            stroke="#38bdf8"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                          {/* Validation Accuracy Line */}
                          <path
                            d={generateSvgPath('valAccuracy', 180, 140)}
                            fill="none"
                            stroke="#2dd4bf"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeDasharray="4,4"
                          />
                        </svg>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-[10.5px]">
                          Click 'Launch' to draw dynamic accuracy curves
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Bottom Console Terminal Output Logs */}
                <div className="bg-slate-950 p-3.5 border border-slate-805 rounded-2xl">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold font-mono text-slate-400 border-b border-slate-900 pb-1.5 mb-1.5">
                    <span>Clinical training console trace</span>
                    <span>Standard Output</span>
                  </div>
                  
                  <div className="h-[90px] overflow-y-auto font-mono text-[9.5px] text-emerald-400 space-y-1 scrollbar-thin text-left leading-normal">
                    {simLogs.length > 0 ? (
                      simLogs.slice(-4).map((log, index) => (
                        <div key={index} className="flex justify-between items-center border-b border-slate-900/45 py-0.5 last:border-none">
                          <span>{`[Epoch ${String(log.epoch).padStart(2, '0')}/${String(estSimEpochs).padStart(2, '0')}] loss: ${isNaN(log.trainLoss) ? 'NaN' : log.trainLoss.toFixed(4)} - val_loss: ${isNaN(log.valLoss) ? 'NaN' : log.valLoss.toFixed(4)}`}</span>
                          <span className="font-semibold text-sky-400">{`acc: ${(log.accuracy * 100).toFixed(1)}% - val_acc: ${(log.valAccuracy * 100).toFixed(1)}%`}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-500 text-center pt-8">
                        No active socket trace pipeline streaming. Console listening for CUDA thread launching...
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 4: FRAMEWORK CODE EXPORTER */}
        {activeTab === 'code' && (
          <div className="space-y-6">
            
            {/* Split layout: Selector Panel + Code block window */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 text-left">
              
              {/* Left Selector Panel */}
              <div className="lg:col-span-2 space-y-4 bg-white p-5 rounded-2xl border border-slate-205">
                <span className="text-[10px] font-bold font-mono text-slate-450 uppercase tracking-widest block pt-1 border-b border-slate-100 pb-1.5">
                  1. Computational Framework
                </span>

                <div className="space-y-2">
                  {[
                    { id: 'pytorch', label: 'PyTorch (Classical)', desc: 'Standard class modular configuration' },
                    { id: 'lightning', label: 'PyTorch Lightning', desc: 'Cluster scalability wrapper wrapper' },
                    { id: 'keras', label: 'TF / Keras 3 Multi-backend', desc: 'Run on JAX / PyTorch backends' }
                  ].map(fw => (
                    <button
                      key={fw.id}
                      type="button"
                      onClick={() => setCodeFramework(fw.id as any)}
                      className={`w-full text-left p-4.5 rounded-xl border transition-all cursor-pointer ${
                        codeFramework === fw.id
                          ? 'bg-fuchsia-50/55 border-fuchsia-300 text-fuchsia-950 font-bold'
                          : 'bg-slate-50/50 border-slate-200 text-slate-650 hover:bg-slate-100/60'
                      }`}
                    >
                      <p className="text-xs font-extrabold">{fw.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{fw.desc}</p>
                    </button>
                  ))}
                </div>

                <span className="text-[10px] font-bold font-mono text-slate-450 uppercase tracking-widest block pt-3 border-b border-slate-100 pb-1.5">
                  2. Pipeline Segment Stage
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'dataset', label: 'Dataset class loader' },
                    { id: 'model', label: 'Model class layer construct' },
                    { id: 'training_loop', label: 'Optimization & training' },
                    { id: 'inference', label: 'ONNX quantization' }
                  ].map(part => (
                    <button
                      key={part.id}
                      type="button"
                      onClick={() => setCodePart(part.id as any)}
                      className={`p-2 rounded-xl text-center border transition-all text-xs font-bold whitespace-normal leading-snug cursor-pointer flex items-center justify-center ${
                        codePart === part.id
                          ? 'bg-fuchsia-600 border-fuchsia-500 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {part.label}
                    </button>
                  ))}
                </div>

              </div>

              {/* Right Code Window Block */}
              <div className="lg:col-span-3 bg-slate-900 border border-slate-805 rounded-3xl overflow-hidden shadow-lg flex flex-col justify-between">
                
                {/* Header operations */}
                <div className="bg-slate-850 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-fuchsia-400" />
                    <span className="text-[10.5px] font-bold font-mono text-slate-300 tracking-wide uppercase">
                      Generated: {codeFramework.toUpperCase()} - {codePart.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const dynamicCode = generateDymamicCode(
                          data.model_name,
                          codeFramework,
                          codePart,
                          estDataType,
                          vramHeuristics,
                          data.training_config
                        );
                        navigator.clipboard.writeText(dynamicCode);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1 px-2.5 py-1 hover:bg-slate-800 border border-slate-800 rounded-lg font-bold cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy Block'}
                    </button>
                  </div>
                </div>

                {/* Actual code blocks */}
                <div className="p-5 overflow-x-auto bg-slate-950/80">
                  <pre className="text-slate-300 font-mono text-xs leading-relaxed text-left">
                    {generateDymamicCode(
                      data.model_name,
                      codeFramework,
                      codePart,
                      estDataType,
                      vramHeuristics,
                      data.training_config
                    )}
                  </pre>
                </div>

                <div className="p-3.5 bg-slate-850 border-t border-slate-805 text-left text-[11px] text-slate-400 flex items-center gap-2 font-mono">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Interactive mapping maps parameters (e.g. Optimizer: {estSimOptimizer}) directly into boilerplate outputs.</span>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    );
  };

  const renderLegacyContent = (content: string) => {
    // Split content by mermaid blocks first to handle diagram
    const mermaidRegex = /```mermaid([\s\S]*?)```/g;
    const mermaidMatch = mermaidRegex.exec(content);
    const mermaidChart = mermaidMatch ? mermaidMatch[1].trim() : null;

    // Remove mermaid block from content for text processing
    const contentWithoutMermaid = content.replace(mermaidRegex, '');
    
    // Split by python code block
    const parts = contentWithoutMermaid.split('```python');
    const textPart = parts[0];
    const pythonCode = parts.length > 1 ? parts[1].split('```')[0].trim() : null;

    const sections: React.ReactNode[] = [];
    const lines = textPart.split('\n');
    let currentBlock: React.ReactNode[] = [];
    
    lines.forEach((line, i) => {
        const trimmed = line.trim();
        if(!trimmed) return;

        if (trimmed.startsWith('### 🧠') || trimmed.includes('Model Architecture')) {
            if(currentBlock.length) sections.push(<div key={`b-${i}`} className="mb-4">{currentBlock}</div>);
            currentBlock = [];
            sections.push(
                <h3 key={i} className="flex items-center gap-2 text-lg font-bold text-fuchsia-900 mt-6 mb-3 border-b border-fuchsia-100 pb-2">
                   <BrainCircuit className="w-5 h-5 text-fuchsia-600" />
                   {trimmed.replace(/###\s*[🧠]?/, '')}
                </h3>
            );
        } else if (trimmed.startsWith('### 📊') || trimmed.includes('Architecture Diagram')) {
             if(currentBlock.length) sections.push(<div key={`b-${i}`} className="mb-4">{currentBlock}</div>);
             currentBlock = [];
             sections.push(
                <h3 key={i} className="flex items-center gap-2 text-lg font-bold text-fuchsia-900 mt-6 mb-3 border-b border-fuchsia-100 pb-2">
                   <Activity className="w-5 h-5 text-fuchsia-600" />
                   Architecture Diagram
                </h3>
             );
             if (mermaidChart) {
                 sections.push(<MermaidDiagram key="mermaid" chart={mermaidChart} />);
             }
        } else if (trimmed.startsWith('### 🛠️') || trimmed.includes('Pipeline Strategy')) {
             if(currentBlock.length) sections.push(<div key={`b-${i}`} className="mb-4">{currentBlock}</div>);
             currentBlock = [];
             sections.push(
                <h3 key={i} className="flex items-center gap-2 text-lg font-bold text-fuchsia-900 mt-6 mb-3 border-b border-fuchsia-100 pb-2">
                   <Settings className="w-5 h-5 text-fuchsia-600" />
                   {trimmed.replace(/###\s*[🛠️]?/, '')}
                </h3>
             );
        } else if (trimmed.startsWith('### 💻') || trimmed.includes('Implementation')) {
             // Skip header
        } else if (trimmed.startsWith('**') && trimmed.includes(':')) {
             currentBlock.push(
                 <div key={i} className="mb-2 text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                     <span className="font-bold text-fuchsia-800">{trimmed.split(':')[0].replace(/\*\*/g, '')}:</span>
                     <span className="ml-2">{trimmed.split(':')[1]?.replace(/\*\*/g, '')}</span>
                 </div>
             )
        } else if (trimmed.startsWith('-')) {
             currentBlock.push(<li key={i} className="ml-4 list-disc text-slate-700 text-sm mb-1">{trimmed.replace(/^-/, '')}</li>);
        } else {
             currentBlock.push(<p key={i} className="text-slate-700 text-sm mb-2">{trimmed.replace(/\*\*/g, '')}</p>);
        }
    });
    if(currentBlock.length) sections.push(<div key="end-text" className="mb-4">{currentBlock}</div>);

    if (pythonCode) {
        sections.push(
            <div key="code" className="mt-6">
                <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700">
                    <Terminal className="w-4 h-4 text-fuchsia-600" />
                    Python Implementation (Scaffolding)
                </div>
                <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto border border-slate-700 shadow-inner">
                    <pre className="text-slate-300 font-mono text-xs leading-relaxed">
                        {pythonCode}
                    </pre>
                </div>
            </div>
        );
    }

    return sections;
  };

  return (
    <div className="w-full bg-slate-50 rounded-2xl shadow-lg border border-fuchsia-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-fuchsia-50 to-purple-50 px-6 py-4.5 border-b border-fuchsia-100 flex justify-between items-center text-left">
        <div className="flex items-center gap-2">
          <div className="bg-white p-2 rounded-xl shadow-xs border border-fuchsia-105 text-fuchsia-600">
            <Cpu className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm md:text-base leading-tight">Bio-AI Model Specification</h3>
            <span className="text-[10px] text-fuchsia-800/70 block tracking-wider uppercase font-mono mt-0.5">Deep Learning Architect</span>
          </div>
        </div>
        <div className="hidden sm:block text-[10.5px] text-fuchsia-700 font-mono font-bold bg-white/70 px-3 py-1.5 rounded-xl border border-fuchsia-100 shadow-xs">
          Wanderers Lab Core VRAM Engine
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        
        {/* User Input context */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs text-left">
          <p className="text-[10px] uppercase tracking-widest text-[#a855f7] font-extrabold mb-1.5 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Bio-Research Target Focus
          </p>
          <p className="text-slate-800 italic text-xs md:text-sm font-bold leading-relaxed">
            "{result.originalQuery}"
          </p>
        </div>

        {/* Tab / Main content */}
        <div>
          {renderContent()}
        </div>

        {/* Global Action operations footer section */}
        <div className="mt-8 pt-6 border-t border-slate-200/65 flex flex-col sm:flex-row justify-between items-center gap-4 select-none">
          
          <div className="flex gap-4">
            <a 
              href="https://pytorch.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-fuchsia-700 hover:text-fuchsia-900 font-extrabold transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Lyre PyTorch Core Docs
            </a>
            <a 
              href="https://huggingface.co/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-purple-700 hover:text-purple-900 font-extrabold transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Hugging Face Hub
            </a>
          </div>

          <div className="flex gap-2.5 self-stretch sm:self-auto select-none">
            
            <button 
              onClick={handleCopy}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl font-bold transition-all text-xs cursor-pointer active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-450" />}
              <span>{copied ? 'Specification Copied!' : 'Copy Raw JSON Spec'}</span>
            </button>

            {parsedData && (
              <button 
                onClick={handleExportPDF}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 text-white shadow-md px-4.5 py-2.5 rounded-xl font-bold transition-all text-xs cursor-pointer active:scale-95 border border-fuchsia-600"
              >
                <FileText className="w-4 h-4 text-fuchsia-100" />
                <span>Export Modern PDF Architecture Report</span>
              </button>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default MLResultCard;
