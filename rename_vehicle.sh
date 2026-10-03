#!/bin/bash

# Rename in src/components/FamilyManager.tsx
sed -i 's/Vehicle/Machine/g' src/components/FamilyManager.tsx
sed -i 's/vehicle/machine/g' src/components/FamilyManager.tsx
sed -i 's/Veículo/Máquina/g' src/components/FamilyManager.tsx
sed -i 's/veículos/máquinas/g' src/components/FamilyManager.tsx
sed -i 's/veículo/máquina/g' src/components/FamilyManager.tsx
sed -i 's/Veículos/Máquinas/g' src/components/FamilyManager.tsx

# Rename in src/App.tsx
sed -i 's/Vehicle/Machine/g' src/App.tsx
sed -i 's/vehicle/machine/g' src/App.tsx

