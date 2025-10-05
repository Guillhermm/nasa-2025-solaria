interface SectionDividerProps {
  hasSmallSpacing?: boolean;
}

const SectionDivider: React.FC<SectionDividerProps> = ({ hasSmallSpacing }) => (
  <div className={`${hasSmallSpacing ? 'py-2' : 'py-4'}`}>
    <hr />
  </div>
);

export default SectionDivider;
