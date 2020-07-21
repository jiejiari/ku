
public class Point {
	public Point parent = null;
	public float F{get;set;}
	public float G{get;set;}
	public float H{get;set;}

	public int X;
	public int Y;
	public bool isWall = false;

    public Point(int x, int y)
    {
        X = x;
        Y = y;
    }
	public void setParent(Point point,float g)
	{
		parent = point;
		G = g;
		F = G + H;
	}
}
