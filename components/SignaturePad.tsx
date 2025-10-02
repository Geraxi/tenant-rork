import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Check, X, RotateCcw } from 'lucide-react-native';
import { Colors } from '@/constants/theme';

interface SignaturePadProps {
  onSave: (signature: string) => void;
  onCancel: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CANVAS_WIDTH = screenWidth - 40;
const CANVAS_HEIGHT = 300;

export default function SignaturePad({ onSave, onCancel }: SignaturePadProps) {
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const pathRef = useRef<string>('');

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const newPath = `M${locationX.toFixed(2)},${locationY.toFixed(2)}`;
      pathRef.current = newPath;
      setCurrentPath(newPath);
    },

    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const newPath = `${pathRef.current} L${locationX.toFixed(2)},${locationY.toFixed(2)}`;
      pathRef.current = newPath;
      setCurrentPath(newPath);
    },

    onPanResponderRelease: () => {
      setPaths(prev => [...prev, pathRef.current]);
      setCurrentPath('');
      pathRef.current = '';
    },
  });

  const clearSignature = () => {
    setPaths([]);
    setCurrentPath('');
    pathRef.current = '';
  };

  const saveSignature = () => {
    if (paths.length === 0 && !currentPath) {
      return;
    }

    // In a real app, you would convert the SVG to base64 image
    // For now, we'll create a mock base64 signature
    const mockSignature = `data:image/svg+xml;base64,${btoa(`
      <svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
        ${paths.map(path => `<path d="${path}" stroke="#000" stroke-width="2" fill="none" />`).join('')}
        ${currentPath ? `<path d="${currentPath}" stroke="#000" stroke-width="2" fill="none" />` : ''}
      </svg>
    `)}`;

    onSave(mockSignature);
  };

  const hasSignature = paths.length > 0 || currentPath.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Firma Digitale</Text>
        <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
          <X size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Usa il dito per firmare nell'area sottostante
        </Text>
      </View>

      <View style={styles.canvasContainer}>
        <View
          style={styles.canvas}
          {...panResponder.panHandlers}
        >
          <Svg
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            style={StyleSheet.absoluteFillObject}
          >
            {paths.map((path, index) => (
              <Path
                key={index}
                d={path}
                stroke={Colors.text}
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {currentPath && (
              <Path
                d={currentPath}
                stroke={Colors.text}
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </Svg>
          
          {!hasSignature && (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Firma qui</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearSignature}
          disabled={!hasSignature}
        >
          <RotateCcw size={20} color={hasSignature ? Colors.text : Colors.textSecondary} />
          <Text style={[styles.clearButtonText, { color: hasSignature ? Colors.text : Colors.textSecondary }]}>
            Cancella
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, !hasSignature && styles.saveButtonDisabled]}
          onPress={saveSignature}
          disabled={!hasSignature}
        >
          <Check size={20} color={Colors.background} />
          <Text style={styles.saveButtonText}>Salva Firma</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  instructions: {
    padding: 20,
    backgroundColor: Colors.backgroundSecondary,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  canvasContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  canvas: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    borderStyle: 'dashed',
    position: 'relative',
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.textSecondary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.background,
  },
});