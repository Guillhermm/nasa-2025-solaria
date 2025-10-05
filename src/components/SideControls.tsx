import { Card, Form, Button } from 'react-bootstrap';

interface SideControlsProps {
  overlays: { id: string; name: string; enabled: boolean }[];
  onToggleOverlay: (id: string) => void;
  onCompareToggle: () => void;
}

export default function SideControls({
  overlays,
  onToggleOverlay,
  onCompareToggle,
}: SideControlsProps) {
  return (
    <Card style={{ height: '100%' }}>
      <Card.Header>Layers / Controls</Card.Header>
      <Card.Body>
        <Form>
          {overlays.map(layer => (
            <Form.Check
              key={layer.id}
              type="checkbox"
              id={`layer-${layer.id}`}
              label={layer.name}
              checked={layer.enabled}
              onChange={() => onToggleOverlay(layer.id)}
            />
          ))}
        </Form>
        <hr />
        <Button variant="secondary" onClick={onCompareToggle}>
          Toggle Compare Mode
        </Button>
      </Card.Body>
    </Card>
  );
}
