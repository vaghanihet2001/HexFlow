import { BaseEdge, getBezierPath, getSmoothStepPath, getStraightPath } from "reactflow";
import { useTheme } from "./ThemeContext";

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  selected,
  data = {},
}) {
  const { theme } = useTheme();

  const edgeType = data.type || "bezier";
  const color = data.color || (theme === "dark" ? "#fff" : "#222");
  const label = data.label || "";

  let edgePath;
  let labelX = (sourceX + targetX) / 2;
  let labelY = (sourceY + targetY) / 2;

  switch (edgeType) {
    case "straight":
      [edgePath, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });
      break;
    case "smoothstep":
      [edgePath, labelX, labelY] = getSmoothStepPath({
                                    sourceX, 
                                    sourceY,
                                    sourcePosition, 
                                    targetX, 
                                    targetY,
                                    targetPosition,
                                    });
      break;
    default:
      [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
      });

  }

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? "#ff5555" : color,
          strokeWidth: selected ? 2.5 : 2,
        }}
      />
      {label && (
        <text
          x={labelX}
          y={labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fill: theme === "dark" ? "#fff" : "#000",
            fontSize: 12,
            pointerEvents: "none",
          }}
        >
          {label}
        </text>
      )}
    </>
  );
}
