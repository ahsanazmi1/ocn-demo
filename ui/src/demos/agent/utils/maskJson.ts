/**
 * Deep-clones an object and replaces values at specified JSON pointer-like paths with "***"
 * Uses dot-notation paths matching redactions and guards against missing keys
 */

export function maskJson(obj: any, paths: string[]): any {
  if (!obj || paths.length === 0) {
    return obj;
  }

  // Deep clone the object
  const cloned = JSON.parse(JSON.stringify(obj));
  
  // Apply masking for each path
  paths.forEach(path => {
    maskPath(cloned, path);
  });
  
  return cloned;
}

/**
 * Masks a specific path in an object
 */
function maskPath(obj: any, path: string): void {
  if (!obj || !path) {
    return;
  }

  const parts = path.split('.');
  let current = obj;
  
  // Navigate to the parent of the target property
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    
    // Handle array indices
    if (part.startsWith('[') && part.endsWith(']')) {
      const index = parseInt(part.slice(1, -1), 10);
      if (Array.isArray(current) && !isNaN(index) && index >= 0 && index < current.length) {
        current = current[index];
      } else {
        return; // Path doesn't exist
      }
    } else {
      // Handle object properties
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return; // Path doesn't exist
      }
    }
    
    // Ensure we're still working with an object
    if (!current || typeof current !== 'object') {
      return;
    }
  }
  
  // Mask the final property
  const finalPart = parts[parts.length - 1];
  
  if (finalPart.startsWith('[') && finalPart.endsWith(']')) {
    // Handle array element
    const index = parseInt(finalPart.slice(1, -1), 10);
    if (Array.isArray(current) && !isNaN(index) && index >= 0 && index < current.length) {
      current[index] = '***';
    }
  } else {
    // Handle object property
    if (current && typeof current === 'object' && finalPart in current) {
      current[finalPart] = '***';
    }
  }
}

/**
 * Helper function to check if a path should be masked based on partial matching
 * This handles cases where redaction paths are more general (e.g., "user.ssn" matches "user.ssn_last4")
 */
export function shouldMaskPath(objPath: string, redactionPaths: string[]): boolean {
  return redactionPaths.some(redactionPath => {
    // Exact match
    if (objPath === redactionPath) {
      return true;
    }
    
    // Check if the object path starts with the redaction path
    if (objPath.startsWith(redactionPath + '.')) {
      return true;
    }
    
    // Check if the redaction path starts with the object path
    if (redactionPath.startsWith(objPath + '.')) {
      return true;
    }
    
    // Check for wildcard-like patterns (e.g., "user.*" or "*.ssn")
    if (redactionPath.includes('*')) {
      const regex = new RegExp(redactionPath.replace(/\*/g, '.*'));
      return regex.test(objPath);
    }
    
    return false;
  });
}

/**
 * Enhanced masking function that handles partial path matching
 */
export function maskJsonEnhanced(obj: any, paths: string[]): any {
  if (!obj || paths.length === 0) {
    return obj;
  }

  const cloned = JSON.parse(JSON.stringify(obj));
  maskObjectRecursive(cloned, '', paths);
  return cloned;
}

/**
 * Recursively mask an object using partial path matching
 */
function maskObjectRecursive(obj: any, currentPath: string, redactionPaths: string[]): void {
  if (!obj || typeof obj !== 'object') {
    return;
  }

  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      const itemPath = currentPath ? `${currentPath}[${index}]` : `[${index}]`;
      if (shouldMaskPath(itemPath, redactionPaths)) {
        obj[index] = '***';
      } else {
        maskObjectRecursive(item, itemPath, redactionPaths);
      }
    });
  } else {
    Object.keys(obj).forEach(key => {
      const keyPath = currentPath ? `${currentPath}.${key}` : key;
      
      if (shouldMaskPath(keyPath, redactionPaths)) {
        obj[key] = '***';
      } else {
        maskObjectRecursive(obj[key], keyPath, redactionPaths);
      }
    });
  }
}








