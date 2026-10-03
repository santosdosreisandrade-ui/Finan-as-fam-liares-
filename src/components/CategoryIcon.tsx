import React from 'react';
import { Home, Utensils, Car, PartyPopper, HeartPulse, Wallet, Lightbulb, Droplet, Flame, MonitorPlay, Gift, Baby, MoreHorizontal, Tag, Bike, GraduationCap, Cat, Dog, Fish, Rabbit, Bird, PiggyBank, Turtle, PawPrint } from 'lucide-react';

interface Props {
  category: string;
  className?: string;
  petSpecies?: string;
}

export const CategoryIcon: React.FC<Props> = ({ category, className = "w-4 h-4", petSpecies }) => {
  const iconProps = { className };
  const normalizedCategory = category.toLowerCase().trim();

  if (normalizedCategory === 'pet') {
    switch (petSpecies?.toLowerCase()) {
      case 'gato': return <Cat {...iconProps} />;
      case 'cachorro': return <Dog {...iconProps} />;
      case 'peixe': return <Fish {...iconProps} />;
      case 'roedor': return <Rabbit {...iconProps} />;
      case 'pássaro': return <Bird {...iconProps} />;
      case 'porco': return <PiggyBank {...iconProps} />;
      case 'réptil': return <Turtle {...iconProps} />;
      default: return <PawPrint {...iconProps} />;
    }
  }

  switch (normalizedCategory) {
    case 'moradia':
      return <Home {...iconProps} />;
    case 'alimentação':
    case 'alimentacao':
      return <Utensils {...iconProps} />;
    case 'transporte':
    case 'veículo':
    case 'veiculo':
      return <Car {...iconProps} />;
    case 'lazer':
      return <PartyPopper {...iconProps} />;
    case 'saúde':
    case 'saude':
      return <HeartPulse {...iconProps} />;
    case 'educação':
    case 'educacao':
      return <GraduationCap {...iconProps} />;
    case 'salário':
    case 'salario':
      return <Wallet {...iconProps} />;
    case 'luz':
      return <Lightbulb {...iconProps} />;
    case 'água':
    case 'agua':
      return <Droplet {...iconProps} />;
    case 'gás':
    case 'gas':
      return <Flame {...iconProps} />;
    case 'streaming':
      return <MonitorPlay {...iconProps} />;
    case 'presente':
      return <Gift {...iconProps} />;
    case 'criança':
    case 'crianca':
      return <Baby {...iconProps} />;
    case 'delivery':
      return <Bike {...iconProps} />;
    case 'outros':
      return <MoreHorizontal {...iconProps} />;
    default:
      return <Tag {...iconProps} />;
  }
};
